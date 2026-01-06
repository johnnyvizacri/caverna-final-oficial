'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Pega os dados da URL (Nome do evento, Preço e ID do Lote)
  const eventName = searchParams.get('event') || 'Evento'
  const price = searchParams.get('price') || '0,00'
  const batchId = searchParams.get('batchId') // <--- O ID do lote vem aqui

  const [loading, setLoading] = useState(false)

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const cpf = formData.get('cpf') as string

    // 1. Busca o evento ativo
    const { data: event } = await supabase.from('events').select('id').eq('status', 'active').single()
    
    if (!event) {
        alert('Erro: Evento não encontrado.')
        setLoading(false)
        return
    }

    // 2. VERIFICAÇÃO DE SEGURANÇA DO LOTE
    // Antes de vender, vê se não acabou o lote no último segundo
    if (batchId) {
        const { data: batchCheck } = await supabase
            .from('event_batches')
            .select('sold_tickets, total_tickets')
            .eq('id', batchId)
            .single()
        
        // Se já vendeu tudo (vendidos >= total), barra a compra
        if (batchCheck && batchCheck.sold_tickets >= batchCheck.total_tickets) {
            alert('Ops! Este lote acabou de esgotar. Por favor, volte e escolha o próximo lote.')
            router.push('/') // Manda o cliente voltar pra Home
            return
        }
    }

    // 3. Gera o código único do ingresso
    const ticketHash = crypto.randomUUID()

    // 4. Cria o Ingresso no Banco (Status PAID)
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
        // 5. SUCESSO! AGORA DESCONTA DO LOTE (+1 Vendido)
        if (batchId) {
            // Busca quantos já vendeu
            const { data: currentBatch } = await supabase
              .from('event_batches')
              .select('sold_tickets')
              .eq('id', batchId)
              .single()
            
            if (currentBatch) {
                // Atualiza somando +1
                await supabase
                  .from('event_batches')
                  .update({ sold_tickets: currentBatch.sold_tickets + 1 })
                  .eq('id', batchId)
            }
        }

        // Leva para o QR Code
        router.push(`/ticket?id=${ticket.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
        
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">CHECKOUT</h2>
        
        <div className="bg-black/50 p-4 rounded mb-6 border border-gray-800">
          <p className="text-gray-400 text-sm uppercase">Resumo do pedido:</p>
          <p className="font-bold text-lg text-white">{eventName}</p>
          <div className="flex justify-between items-center mt-2 border-t border-gray-700 pt-2">
            <span className="text-xs text-gray-400 uppercase">Valor a pagar</span>
            <span className="text-purple-400 font-bold text-xl">R$ {price.replace('.', ',')}</span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
            <input name="name" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none placeholder-gray-600" placeholder="Seu nome" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
            <input name="email" required type="email" className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none placeholder-gray-600" placeholder="seu@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF</label>
              <input name="cpf" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none placeholder-gray-600" placeholder="000.000..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Celular</label>
              <input name="phone" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 focus:border-purple-500 outline-none placeholder-gray-600" placeholder="(17)..." />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-400 text-black font-black uppercase py-4 rounded mt-4 transition-transform active:scale-95"
          >
            {loading ? 'Validando...' : 'Confirmar e Pagar'}
          </button>
        </form>

        <button onClick={() => window.history.back()} type="button" className="w-full text-center text-gray-500 text-sm mt-4 hover:text-white">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Carregando pagamento...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}