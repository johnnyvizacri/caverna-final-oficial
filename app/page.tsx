'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from './lib/supabase'

export default function Home() {
  const [event, setEvent] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<any>(null)

  useEffect(() => {
    loadEventAndBatches()
  }, [])

  async function loadEventAndBatches() {
    // 1. Carrega o Evento
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .single()
    
    if (eventData) {
      setEvent(eventData)
      
      // 2. Carrega os Lotes desse evento
      const { data: batchData } = await supabase
        .from('event_batches')
        .select('*')
        .eq('event_id', eventData.id)
        .order('price', { ascending: true }) // Do mais barato pro mais caro
      
      if (batchData) {
        setBatches(batchData)
        // Seleciona automaticamente o primeiro lote disponível
        const firstAvailable = batchData.find((b: any) => b.sold_tickets < b.total_tickets)
        if (firstAvailable) setSelectedBatch(firstAvailable)
      }
    }
  }

  if (!event) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando festa...</div>

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      
      {/* Banner / Imagem (Pode melhorar depois) */}
      <div className="w-full h-64 bg-purple-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
        <div className="flex items-center justify-center h-full">
            <h1 className="text-4xl font-black uppercase tracking-tighter z-10">{event.title}</h1>
        </div>
      </div>

      <div className="w-full max-w-md px-6 -mt-10 z-20">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
          
          <div className="flex justify-between text-sm text-gray-400 mb-6 font-bold uppercase tracking-widest">
            <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
            <span>Rio Preto</span>
          </div>

          <h3 className="text-lg font-bold mb-4 text-white">Escolha seu ingresso:</h3>

          <div className="space-y-3 mb-8">
            {batches.map((batch) => {
              const isSoldOut = batch.sold_tickets >= batch.total_tickets
              const isSelected = selectedBatch?.id === batch.id

              return (
                <button
                  key={batch.id}
                  disabled={isSoldOut}
                  onClick={() => setSelectedBatch(batch)}
                  className={`w-full flex justify-between items-center p-4 rounded-lg border-2 transition-all ${
                    isSoldOut 
                      ? 'border-gray-800 bg-gray-800/50 opacity-50 cursor-not-allowed' 
                      : isSelected 
                        ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                        : 'border-gray-700 hover:border-gray-500 bg-black'
                  }`}
                >
                  <div className="text-left">
                    <p className={`font-bold ${isSoldOut ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {batch.name}
                    </p>
                    {isSoldOut ? (
                      <span className="text-red-500 text-xs font-bold uppercase">Esgotado</span>
                    ) : (
                      <span className="text-gray-400 text-xs">{batch.total_tickets - batch.sold_tickets} unidades restam</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold text-lg ${isSoldOut ? 'text-gray-500' : 'text-green-400'}`}>
                      R$ {batch.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Botão de Compra Dinâmico */}
          {selectedBatch ? (
            <Link 
              href={`/checkout?event=${encodeURIComponent(event.title)}&price=${selectedBatch.price}&batchId=${selectedBatch.id}`}
              className="block w-full"
            >
              <button className="w-full bg-green-500 hover:bg-green-400 text-black font-black uppercase py-4 rounded-lg transition-transform active:scale-95">
                Comprar {selectedBatch.name} • R$ {selectedBatch.price.toFixed(2).replace('.', ',')}
              </button>
            </Link>
          ) : (
            <button disabled className="w-full bg-gray-800 text-gray-500 font-bold uppercase py-4 rounded-lg cursor-not-allowed">
              Selecione um lote
            </button>
          )}

        </div>
        
        <p className="text-center text-gray-600 text-xs mt-8 pb-8">
          A Caverna Eventos • Classificação 18 anos
        </p>
      </div>
    </div>
  )
}