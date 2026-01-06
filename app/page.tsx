'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [events, setEvents] = useState<any[]>([])

  // Buscar eventos assim que a página carrega
  useEffect(() => {
    getEvents()
  }, [])

  async function getEvents() {
    // Busca todos os eventos ativos no Supabase
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
    
    if (data) setEvents(data)
    if (error) console.log('Erro ao buscar:', error)
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      {/* Cabeçalho */}
      <header className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-black/90 backdrop-blur z-10">
        <h1 className="text-2xl font-bold tracking-tighter text-yellow-400 uppercase">
          A Caverna <span className="text-white text-xs block font-normal tracking-normal">Rio Preto</span>
        </h1>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          AGENDA
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Garanta seu ingresso antecipado e evite filas.
        </p>
      </section>

      {/* Lista de Eventos */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          
          {events.map((event) => (
            <div key={event.id} className="group border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition-all bg-gray-900/50">
              {/* Imagem do Evento */}
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={event.image_url || 'https://via.placeholder.com/800x400'} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-sm">
                  R$ {event.price}
                </div>
              </div>

              {/* Informações */}
              <div className="p-5">
                <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">
                  {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
                <h3 className="text-xl font-bold mb-2 leading-tight">{event.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{event.description}</p>
                
                <a 
  href={`/checkout?event=${encodeURIComponent(event.title)}&price=${event.price}`}
  className="block w-full text-center py-3 bg-white text-black font-bold uppercase tracking-wide hover:bg-purple-500 hover:text-white transition-colors rounded"
>
  Comprar Ingresso
</a>
              </div>
            </div>
          ))}

        </div>

        {events.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            Carregando eventos...
          </div>
        )}
      </section>
    </main>
  )
}