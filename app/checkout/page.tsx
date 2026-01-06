'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const eventName = searchParams.get('event') || 'Evento'
  const [loading, setLoading] = useState(false)
  
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<any>(null)

  useEffect(() => {
    async function loadBatches() {
      const { data: event } = await supabase.from('events').select('id').eq('status', 'active').single()
      
      if (event) {
        const { data: batchData } = await supabase
          .from('event_batches')
          .select('*')
          .eq('event_id', event.id)
          .order('price', { ascending: true })
        
        if (batchData) {
            setBatches(batchData)
            const firstAvailable = batchData.find((b: any) => b.sold_tickets < b.total_tickets)
            if (firstAvailable) setSelectedBatch(firstAvailable)
        }
      }
    }
    loadBatches()
  }, [])

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedBatch) {
        alert('Por favor, selecione um tipo de ingresso (Lote).')
        return
    }

    setLoading(true)
    
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const cpf = formData.get('cpf') as string
    const phone = formData.get('phone') as string

    // 1. Validação Final de Estoque (BLINDAGEM ADICIONADA)
    const { data: batchCheck } = await supabase
        .from('event_batches')
        .select('sold_tickets, total_tickets')
        .eq('id', selectedBatch.id)
        .single()
    
    // Se não conseguir ler o banco, para tudo
    if (!batchCheck) {
       alert('Erro de conexão ao verificar estoque. Tente novamente.')
       setLoading(false)
       return
    }
    
    if (batchCheck.sold_tickets >= batchCheck.total_tickets) {
        alert('Ops! Esse lote esgotou agora. Escolha outro.')
        setLoading(false)
        window.location.reload()
        return
    }

    const ticketHash = crypto.randomUUID()
    
    // Busca ID do evento (BLINDAGEM ADICIONADA)
    const { data: event } = await supabase.from('events').select('id').eq('status', 'active').single()

    if (!event) {
        alert('Erro crítico: Evento não localizado.')
        setLoading(false)
        return
    }

    // 2. Cria Ingresso
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
        alert('Erro ao processar ingresso.')
        setLoading(false)
    } else {
        // 3. Desconta do Lote
        await supabase
          .from('event_batches')
          .update({ sold_tickets: batchCheck.sold_tickets + 1 })
          .eq('id', selectedBatch.id)

        router.push(`/ticket?id=${ticket.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
        
        <h2 className="text-xl font-bold mb-4 text-center text-yellow-400 uppercase">Finalizar Compra</h2>
        <p className="text-center text-white font-bold mb-6">{eventName}</p>

        {/* SELEÇÃO DE LOTES */}
        <div className="mb-6 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase">1. Escolha seu ingresso</p>
            {batches.map(batch => {
                const isSoldOut = batch.sold_tickets >= batch.total_tickets
                const isSelected = selectedBatch?.id === batch.id
                
                return (
                    <div 
                        key={batch.id}
                        onClick={() => !isSoldOut && setSelectedBatch(batch)}
                        className={`
                            p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all
                            ${isSoldOut ? 'bg-gray-800 border-gray-800 opacity-50' : 
                              isSelected ? 'bg-purple-900/30 border-purple-500' : 'bg-black border-gray-700 hover:border-gray-500'}
                        `}
                    >
                        <div>
                            <p className={`font-bold text-sm ${isSoldOut ? 'line-through text-gray-500' : 'text-white'}`}>{batch.name}</p>
                            {isSoldOut ? (
                                <span className="text-[10px] text-red-500 font-bold uppercase">Esgotado</span>
                            ) : (
                                <span className="text-[10px] text-gray-400">Resta: {batch.total_tickets - batch.sold_tickets}</span>
                            )}
                        </div>
                        <p className="font-bold text-green-400">R$ {batch.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                )
            })}
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handlePayment} className="space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase mt-6">2. Seus Dados</p>
          
          <input name="name" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 text-sm focus:border-purple-500 outline-none" placeholder="Nome Completo" />
          <input name="email" required type="email" className="w-full bg-black border border-gray-700 rounded p-3 text-sm focus:border-purple-500 outline-none" placeholder="E-mail" />
          
          <div className="grid grid-cols-2 gap-3">
            <input name="cpf" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 text-sm focus:border-purple-500 outline-none" placeholder="CPF" />
            <input name="phone" required type="text" className="w-full bg-black border border-gray-700 rounded p-3 text-sm focus:border-purple-500 outline-none" placeholder="Celular" />
          </div>

          <div className="pt-4 mt-4 border-t border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm">Total a pagar:</span>
                <span className="text-2xl font-bold text-purple-400">
                    R$ {selectedBatch ? selectedBatch.price.toFixed(2).replace('.', ',') : '0,00'}
                </span>
            </div>

            <button 
                disabled={loading || !selectedBatch}
                type="submit" 
                className={`w-full font-black uppercase py-4 rounded transition-all active:scale-95 ${
                    loading || !selectedBatch ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-400 text-black'
                }`}
            >
                {loading ? 'Processando...' : 'PAGAR AGORA'}
            </button>
          </div>
        </form>

        <button onClick={() => window.history.back()} type="button" className="w-full text-center text-gray-500 text-xs mt-4 hover:text-white">
          Voltar
        </button>
      </div>
    </div>
  )
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}