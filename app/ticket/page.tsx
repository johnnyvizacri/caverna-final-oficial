'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'

export default function Ticket() {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('id')
  const [ticket, setTicket] = useState<any>(null)

  useEffect(() => {
    if (ticketId) loadTicket()
  }, [ticketId])

  async function loadTicket() {
    const { data } = await supabase
      .from('tickets')
      .select('*, events(*)')
      .eq('id', ticketId)
      .single()
    
    if (data) setTicket(data)
  }

  if (!ticket) return <div className="text-white p-10 text-center">Carregando seu ingresso...</div>

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="bg-white text-black p-6 rounded-2xl w-full max-w-xs shadow-[0_0_30px_rgba(168,85,247,0.4)] text-center relative overflow-hidden">
        
        {/* Faixa decorativa */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>

        <h2 className="text-2xl font-black uppercase mb-1 tracking-tighter">A Caverna</h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Rio Preto</p>

        <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

        <h3 className="text-lg font-bold leading-tight mb-2">{ticket.events?.title}</h3>
        <p className="text-sm text-gray-600 mb-6">
          {new Date(ticket.events?.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute:'2-digit' })}
        </p>

        {/* O QR CODE MÁGICO */}
        <div className="flex justify-center p-2 border-4 border-black/10 rounded-lg mx-auto w-fit mb-4">
          <QRCodeSVG value={ticket.ticket_hash} size={180} />
        </div>

        <p className="text-xs text-gray-400 font-mono uppercase break-all">
          HASH: {ticket.ticket_hash.substring(0, 15)}...
        </p>

        <div className="mt-6 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold inline-block">
          PAGAMENTO APROVADO
        </div>
      </div>

      <button onClick={() => window.print()} className="mt-8 text-gray-500 hover:text-white underline">
        Salvar / Imprimir
      </button>
    </div>
  )
}