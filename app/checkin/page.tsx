'use client'
import { useEffect, useState, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Checkin() {
  const router = useRouter()
  
  // Estados da Interface
  const [message, setMessage] = useState('Aponte para o QR Code')
  const [statusColor, setStatusColor] = useState('bg-black') // Controla a cor do fundo (pisca)
  const [showList, setShowList] = useState(false) // Abre/Fecha modal da lista
  
  // Dados
  const [tickets, setTickets] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const scannerRef = useRef<Html5Qrcode | null>(null)

  // 1. SEGURANÇA: Se não estiver logado, manda voltar
  useEffect(() => {
    const isAuth = localStorage.getItem('staff_auth')
    if (isAuth !== 'true') {
      router.push('/staff')
    }
  }, [])

  // 2. INICIALIZAÇÃO: Liga Câmera e Carrega Lista
  useEffect(() => {
    startCamera()
    loadGuestList()

    return () => {
      // Limpeza ao sair da página
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Erro ao parar camera", err))
      }
    }
  }, [])

  // Função: Carregar Lista do Banco
  async function loadGuestList() {
    const { data } = await supabase
      .from('tickets')
      .select('*, events(title)')
      .order('customer_name', { ascending: true })
    
    if (data) setTickets(data)
  }

  // Função: Iniciar Câmera
  async function startCamera() {
    try {
      // Pede permissão
      await navigator.mediaDevices.getUserMedia({ video: true })
      
      const html5QrCode = new Html5Qrcode("reader")
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" }, // Câmera traseira
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { onScanSuccess(decodedText) }, // Se ler, chama essa função
        (errorMessage) => {} // Se falhar frame, ignora
      )
    } catch (err) {
      console.error("Erro câmera:", err)
      setMessage('⚠️ Câmera bloqueada ou indisponível.\nUse a Lista Manual abaixo.')
    }
  }

  // Lógica: QR Code Lido
  async function onScanSuccess(decodedText: string) {
    if(!scannerRef.current) return
    try { await scannerRef.current.pause() } catch(e){} // Pausa para não ler 2x

    // Procura na memória (mais rápido que ir no banco)
    const ticketIndex = tickets.findIndex(t => t.ticket_hash === decodedText)
    
    if (ticketIndex === -1) {
      flashScreen('bg-red-600', '❌ INGRESSO NÃO ENCONTRADO')
      return
    }

    const ticket = tickets[ticketIndex]
    processCheckin(ticket)
  }

  // Lógica: Processar Entrada (Serve p/ Câmera e Manual)
  async function processCheckin(ticket: any) {
    if (ticket.status === 'checked_in') {
      flashScreen('bg-orange-600', `⚠️ JÁ ENTROU!\n${ticket.customer_name}`)
    } else {
      // 1. Atualiza no Banco
      await supabase
        .from('tickets')
        .update({ status: 'checked_in', checked_in_at: new Date() })
        .eq('id', ticket.id)

      // 2. Atualiza na Memória (para o contador mudar na hora)
      const updatedList = tickets.map(t => 
        t.id === ticket.id ? { ...t, status: 'checked_in', checked_in_at: new Date() } : t
      )
      setTickets(updatedList)

      flashScreen('bg-green-600', `✅ LIBERADO!\n${ticket.customer_name}`)
    }
  }

  // Efeito Visual: Piscar Tela
  function flashScreen(color: string, msg: string) {
    setStatusColor(color)
    setMessage(msg)
    
    // Volta ao normal depois de 2.5 segundos
    setTimeout(async () => {
      setStatusColor('bg-black')
      setMessage('Aponte para o QR Code...')
      try { await scannerRef.current?.resume() } catch(e){}
    }, 2500)
  }

  // --- CÁLCULOS DOS CONTADORES ---
  const totalVendidos = tickets.length
  const totalEntraram = tickets.filter(t => t.status === 'checked_in').length
  const totalFaltam = totalVendidos - totalEntraram

  // Filtro da Lista Manual
  const filteredTickets = tickets.filter(t => 
    t.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customer_cpf?.includes(searchTerm)
  )

  return (
    <div className={`min-h-screen ${statusColor} text-white transition-colors duration-300 flex flex-col relative overflow-hidden`}>
      
      {/* --- PLACAR FIXO NO TOPO --- */}
      <div className="bg-gray-900/90 backdrop-blur-md p-2 grid grid-cols-3 gap-2 text-center border-b border-gray-700 z-20 shadow-lg">
        <div className="bg-green-900/40 rounded p-2 border border-green-900/50">
          <span className="block text-2xl font-black text-green-400 leading-none">{totalEntraram}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-green-200/50">Dentro</span>
        </div>
        <div className="bg-red-900/40 rounded p-2 border border-red-900/50">
          <span className="block text-2xl font-black text-red-400 leading-none">{totalFaltam}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-red-200/50">Faltam</span>
        </div>
        <div className="bg-gray-800 rounded p-2 border border-gray-700">
          <span className="block text-2xl font-black text-white leading-none">{totalVendidos}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Total</span>
        </div>
      </div>

      {/* --- ÁREA DA CÂMERA (OCUPA O RESTO DA TELA) --- */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <div id="reader" className="w-full h-full object-cover absolute inset-0"></div>
        
        {/* Mensagem Centralizada */}
        <div className="absolute bottom-32 left-0 right-0 text-center px-6 pointer-events-none z-10">
          <span className="bg-black/70 text-white px-6 py-4 rounded-2xl font-bold text-lg backdrop-blur-md whitespace-pre-line shadow-2xl border border-white/10 inline-block">
            {message}
          </span>
        </div>
      </div>

      {/* --- BOTÃO FLUTUANTE DA LISTA --- */}
      <div className="fixed bottom-8 right-8 z-30">
        <button 
          onClick={() => setShowList(true)}
          className="bg-white text-black w-16 h-16 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center active:scale-90 transition-transform hover:bg-gray-200"
        >
          <span className="text-3xl">📋</span>
        </button>
      </div>

      {/* --- MODAL DA LISTA MANUAL --- */}
      {showList && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
          
          {/* Cabeçalho do Modal */}
          <div className="p-4 bg-gray-800 flex justify-between items-center shadow-lg border-b border-gray-700">
            <h2 className="font-bold text-lg uppercase text-white tracking-widest">Lista de Convidados</h2>
            <button 
              onClick={() => setShowList(false)}
              className="text-gray-400 hover:text-white font-bold text-sm bg-black/20 px-3 py-1 rounded"
            >
              FECHAR X
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="p-4 bg-gray-900">
             <input 
              autoFocus
              type="text" 
              placeholder="Digite nome ou CPF..." 
              className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition-colors text-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista Rolável */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10 bg-black/50">
             {filteredTickets.length === 0 && (
                <p className="text-center text-gray-500 mt-10 italic">Nenhum convidado encontrado.</p>
             )}

             {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                  <div>
                    <p className="font-bold text-white text-lg">{ticket.customer_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{ticket.customer_cpf} • {ticket.events?.title}</p>
                  </div>
                  
                  {ticket.status === 'checked_in' ? (
                    <span className="text-green-500 text-[10px] font-black border border-green-900 bg-green-900/20 px-3 py-1 rounded uppercase tracking-widest">
                      JÁ ENTROU
                    </span>
                  ) : (
                    <button 
                      onClick={() => {
                        if(confirm(`Confirmar entrada manual de: ${ticket.customer_name}?`)) {
                          processCheckin(ticket)
                          setShowList(false) // Fecha a lista para mostrar o verde
                        }
                      }}
                      className="bg-white text-black px-5 py-2 rounded-lg font-black text-xs uppercase hover:bg-gray-200 active:scale-95 transition-transform"
                    >
                      Liberar
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}