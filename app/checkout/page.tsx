'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Checkout() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const eventName = searchParams.get('event') || 'Evento'
  const price = searchParams.get('price') || '0,00'
  const [loading, setLoading] = useState(false)

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    // 1. Pega os dados que você digitou
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const cpf = formData.get('cpf') as string

    // 2. Acha o evento no banco
    const { data: event } = await supabase.from('events').select('id').eq('status', 'active').single()
    
    if (!event) {
        alert('Erro: Evento não encontrado no sistema.')
        setLoading(false)
        return
    }

    // 3. Cria um código secreto para o ingresso
    const ticketHash = crypto.randomUUID()

    // 4. Salva o ingresso no Supabase
    const { data: ticket, error } = await supabase.from('tickets').insert({
        event_id: event.id,
        customer_name: name,
        customer_email: email,
        customer_cpf: cpf,
        ticket_hash: ticketHash,
        status: 'paid' 
    }).select().single()

    if (error) {
        console.log(error)
        alert('Erro ao gerar ingresso. Tente novamente.')
        setLoading(false)
    } else {
        // 5. Sucesso! Leva para a tela do QR Code
        router.push(`/ticket?id=${ticket.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
        
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">CHECKOUT</h2>
        
        <div className="bg-black/50 p-4 rounded mb-6 border border-gray-800">
          <p className="text-gray-400 text-sm uppercase">Você está comprando:</p>
          <p className="font-bold text-lg text-white">{eventName}</p>
          <p className="text-purple-400 font-bold mt-1">R$ {price}</p>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
            <input name="name" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none" placeholder="Seu nome" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
            <input name="email" required type="email" className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none" placeholder="seu@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF</label>
              <input name="cpf" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none" placeholder="000..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Celular</label>
              <input name="phone" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none" placeholder="(17)..." />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-400 text-black font-black uppercase py-4 rounded mt-4"
          >
            {loading ? 'Processando...' : 'Pagar Agora'}
          </button>
        </form>

        <button onClick={() => window.history.back()} type="button" className="w-full text-center text-gray-500 text-sm mt-4 hover:text-white">
          Voltar
        </button>
      </div>
    </div>
  )
}