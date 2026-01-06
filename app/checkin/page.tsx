'use client'
import { useEffect, useState, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'

export default function Checkin() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [message, setMessage] = useState('Iniciando câmera...')
  const [statusColor, setStatusColor] = useState('bg-gray-900')
  const [hasPermission, setHasPermission] = useState(false)
  
  // Lista de Convidados e Filtros
  const [tickets, setTickets] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    startCamera()
    loadGuestList()

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(err => console.error(err))
      }
    }
  }, [])

  // 1. Carrega a lista de quem comprou
  async function loadGuestList() {
    const { data } = await supabase
      .from('tickets')
      .select('*, events(title)')
      .order('customer_name', { ascending: true }) // Ordem Alfabética
    
    if (data) setTickets(data)
  }

  // 2. Lógica da Câmera (Igual a anterior)
  async function startCamera() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setHasPermission(true)
      
      const html5QrCode = new Html5Qrcode("reader")
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { onScanSuccess(decodedText) },
        (errorMessage) => {}
      )
      setMessage('Aponte para o QR Code')
    } catch (err) {
      console.error("Erro câmera:", err)
      setMessage('⚠️ Use a lista manual abaixo (Câmera bloqueada)')
    }
  }

  // 3. Quando o QR Code é lido
  async function onScanSuccess(decodedText: string) {
    if(!scannerRef.current) return
    try { await scannerRef.current.pause() } catch(e){}

    // Busca na lista local primeiro para ser rápido
    const ticketIndex = tickets.findIndex(t => t.ticket_hash === decodedText)
    
    if (ticketIndex === -1) {
      setStatusColor('bg-red-600')
      setMessage('❌ INGRESSO NÃO ENCONTRADO')
      resumeScanner()
      return
    }

    const ticket = tickets[ticketIndex]
    processCheckin(ticket)
  }

  // 4. Função que dá baixa (Serve tanto pro QR Code quanto pro Manual)
  async function processCheckin(ticket: any) {
    if (ticket.status === 'checked_in') {
      setStatusColor('bg-orange-600')
      setMessage(`⚠️ JÁ UTILIZADO!\n${ticket.customer_name}`)
      resumeScanner()
    } else {
      // Atualiza no Banco
      await supabase
        .from('tickets')
        .update({ status: 'checked_in', checked_in_at: new Date() })
        .eq('id', ticket.id)

      // Atualiza na Lista Local (para o contador mudar na hora)
      const updatedList = tickets.map(t => 
        t.id === ticket.id ? { ...t, status: 'checked_in', checked_in_at: new Date() } : t
      )
      setTickets(updatedList)

      setStatusColor('bg-green-600')
      setMessage(`✅ LIBERADO!\n${ticket.customer_name}`)
      resumeScanner()
    }
  }

  function resumeScanner() {
    setTimeout(async () => {
      setStatusColor('bg-gray-900')
      setMessage('Pronto para o próximo...')
      try { await scannerRef.current?.resume() } catch(e){}
    }, 2500)
  }

  // 5. Cálculos dos Contadores
  const totalVendidos = tickets.length
  const totalEntraram = tickets.filter(t => t.status === 'checked_in').length
  const totalFaltam = totalVendidos - totalEntraram

  // Filtro de busca por nome
  const filteredTickets = tickets.filter(t => 
    t.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`min-h-screen ${statusColor} text-white transition-colors duration-500 flex flex-col`}>
      
      {/* CÂMERA E MENSAGEM */}
      <div className="p-4 bg-black/20 backdrop-blur-sm sticky top-0 z-10 shadow-xl">
        <h1 className="text-xl font-bold text-center mb-2 uppercase">Portaria Caverna</h1>
        
        {/* Painel de Status da Leitura */}
        <div className="bg-white/10 p-3 rounded-lg text-center mb-4 border border-white/20">
          <p className="font-bold whitespace-pre-line text-lg">{message}</p>
        </div>

        {/* Área da Câmera (Escondida se quiser focar na lista) */}
        <div className="bg-black rounded-lg overflow-hidden border border-white/10 h-48 w-full relative">
            <div id="reader" className="w-full h-full object-cover"></div>
        </div>
      </div>

      {/* PLACAR DE PÚBLICO */}
      <div className="grid grid-cols-3 gap-2 p-4 text-center bg-black/40 text-xs font-mono uppercase tracking-widest border-b border-white/10">
        <div className="bg-green-900/40 p-2 rounded">
          <span className="block text-2xl font-bold text-green-400">{totalEntraram}</span>
          Entraram
        </div>
        <div className="bg-red-900/40 p-2 rounded">
          <span className="block text-2xl font-bold text-red-400">{totalFaltam}</span>
          Faltam
        </div>
        <div className="bg-gray-800 p-2 rounded">
          <span className="block text-2xl font-bold text-white">{totalVendidos}</span>
          Total
        </div>
      </div>

      {/* LISTA DE CONVIDADOS */}
      <div className="flex-1 bg-white text-black p-4 rounded-t-3xl mt-2 overflow-y-auto">
        <h3 className="font-bold text-gray-500 uppercase text-xs mb-3 tracking-widest">Lista de Nomes (A-Z)</h3>
        
        {/* Campo de Busca Rápida */}
        <input 
          type="text" 
          placeholder="Buscar nome..." 
          className="w-full bg-gray-100 border-none rounded-lg p-3 mb-4 text-sm focus:ring-2 ring-purple-500 outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="space-y-3 pb-20">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <p className="font-bold text-sm truncate w-48">{ticket.customer_name}</p>
                <p className="text-xs text-gray-400">CPF: {ticket.customer_cpf}</p>
              </div>
              
              {ticket.status === 'checked_in' ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                  JÁ ENTROU
                </span>
              ) : (
                <button 
                  onClick={() => {
                    if(confirm(`Confirmar entrada manual de ${ticket.customer_name}?`)) {
                      processCheckin(ticket)
                    }
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase active:scale-95 transition-transform"
                >
                  Liberar
                </button>
              )}
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-10">Nenhum ingresso encontrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}