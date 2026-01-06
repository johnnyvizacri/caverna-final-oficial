'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation' // <--- NOVO: Importante para redirecionar
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'

export default function Checkin() {
  const router = useRouter() // <--- NOVO: Inicializa o roteador

  const [scanResult, setScanResult] = useState<string | null>(null)
  const [message, setMessage] = useState('Aponte para o QR Code')
  const [statusColor, setStatusColor] = useState('bg-black') 
  const [showList, setShowList] = useState(false) 
  
  const [tickets, setTickets] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    // --- 1. BLOQUEIO DE SEGURANÇA (NOVO) ---
    // Verifica se o usuário tem a chave 'staff_auth' salva no navegador
    const isLogged = localStorage.getItem('staff_auth')
    
    if (isLogged !== 'true') {
      // Se não tiver a chave, chuta ele para a tela de login
      router.push('/staff')
      return 
    }
    // ---------------------------------------

    // Se passou pela segurança, carrega o resto normal
    startCamera()
    loadGuestList()

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(err => console.error(err))
      }
    }
  }, [])

  async function loadGuestList() {
    const { data } = await supabase
      .from('tickets')
      .select('*, events(title)')
      .order('customer_name', { ascending: true })
    
    if (data) setTickets(data)
  }

  async function startCamera() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      
      const html5QrCode = new Html5Qrcode("reader")
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { onScanSuccess(decodedText) },
        (errorMessage) => {}
      )
    } catch (err) {
      console.error("Erro câmera:", err)
      setMessage('⚠️ Câmera bloqueada. Use a Lista Manual.')
    }
  }

  async function onScanSuccess(decodedText: string) {
    if(!scannerRef.current) return
    try { await scannerRef.current.pause() } catch(e){}

    const ticketIndex = tickets.findIndex(t => t.ticket_hash === decodedText)
    
    if (ticketIndex === -1) {
      flashScreen('bg-red-600', '❌ INGRESSO NÃO ENCONTRADO')
      return
    }

    const ticket = tickets[ticketIndex]
    processCheckin(ticket)
  }

  async function processCheckin(ticket: any) {
    if (ticket.status === 'checked_in') {
      flashScreen('bg-orange-600', `⚠️ JÁ ENTROU!\n${ticket.customer_name}`)
    } else {
      await supabase
        .from('tickets')
        .update({ status: 'checked_in', checked_in_at: new Date() })
        .eq('id', ticket.id)

      const updatedList = tickets.map(t => 
        t.id === ticket.id ? { ...t, status: 'checked_in', checked_in_at: new Date() } : t
      )
      setTickets(updatedList)

      flashScreen('bg-green-600', `✅ LIBERADO!\n${ticket.customer_name}`)
    }
  }

  function flashScreen(color: string, msg: string) {
    setStatusColor(color)
    setMessage(msg)
    
    setTimeout(async () => {
      setStatusColor('bg-black')
      setMessage('Pronto para o próximo...')
      try { await scannerRef.current?.resume() } catch(e){}
    }, 2500)
  }

  const totalVendidos = tickets.length
  const totalEntraram = tickets.filter(t => t.status === 'checked_in').length
  const totalFaltam = totalVendidos - totalEntraram

  const filteredTickets = tickets.filter(t => 
    t.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`min-h-screen ${statusColor} text-white transition-colors duration-300 flex flex-col relative`}>
      
      {/* CABEÇALHO FIXO COM CONTADORES */}
      <div className="bg-gray-900/90 backdrop-blur p-3 grid grid-cols-3 gap-2 text-center border-b border-gray-700 z-20">
        <div className="bg-green-900/50 rounded p-1">
          <span className="block text-xl font-bold text-green-400">{totalEntraram}</span>
          <span className="text-[10px] uppercase">Dentro</span>
        </div>
        <div className="bg-red-900/50 rounded p-1">
          <span className="block text-xl font-bold text-red-400">{totalFaltam}</span>
          <span className="text-[10px] uppercase">Faltam</span>
        </div>
        <div className="bg-gray-700/50 rounded p-1">
          <span className="block text-xl font-bold text-white">{totalVendidos}</span>
          <span className="text-[10px] uppercase">Total</span>
        </div>
      </div>

      {/* CÂMERA */}
      <div className="flex-1 relative bg-black">
        <div id="reader" className="w-full h-full object-cover absolute inset-0"></div>
        <div className="absolute bottom-24 left-0 right-0 text-center px-4 pointer-events-none">
          <span className="bg-black/60 text-white px-4 py-2 rounded-full font-bold text-lg backdrop-blur-sm whitespace-pre-line shadow-lg">
            {message}
          </span>
        </div>
      </div>

      {/* BOTÃO LISTA */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => setShowList(true)}
          className="bg-white text-black w-14 h-14 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center font-bold text-2xl active:scale-90 transition-transform"
        >
          📋
        </button>
      </div>

      {/* MODAL LISTA */}
      {showList && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-4 bg-gray-800 flex justify-between items-center shadow-lg">
            <h2 className="font-bold text-lg uppercase">Lista de Convidados</h2>
            <button 
              onClick={() => setShowList(false)}
              className="text-gray-400 hover:text-white font-bold p-2"
            >
              FECHAR ✕
            </button>
          </div>

          <div className="p-4 bg-gray-900 border-b border-gray-800">
             <input 
              autoFocus
              type="text" 
              placeholder="Buscar nome ou CPF..." 
              className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white focus:border-purple-500 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
             {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div>
                    <p className="font-bold text-white">{ticket.customer_name}</p>
                    <p className="text-xs text-gray-500">{ticket.customer_cpf} • {ticket.events?.title}</p>
                  </div>
                  
                  {ticket.status === 'checked_in' ? (
                    <span className="text-green-500 text-xs font-bold border border-green-900 bg-green-900/20 px-3 py-1 rounded">
                      ENTROU
                    </span>
                  ) : (
                    <button 
                      onClick={() => {
                        if(confirm(`Liberar entrada de ${ticket.customer_name}?`)) {
                          processCheckin(ticket)
                          setShowList(false)
                        }
                      }}
                      className="bg-white text-black px-4 py-2 rounded font-bold text-xs uppercase hover:bg-gray-200"
                    >
                      Liberar
                    </button>
                  )}
                </div>
              ))}
              {filteredTickets.length === 0 && <p className="text-center text-gray-500 mt-10">Ninguém encontrado.</p>}
          </div>
        </div>
      )}
    </div>
  )
}