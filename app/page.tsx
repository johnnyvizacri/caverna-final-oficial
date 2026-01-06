'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from './lib/supabase'

export default function Home() {
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    // Busca apenas o evento ativo
    async function loadEvent() {
      const { data } = await supabase.from('events').select('*').eq('status', 'active').single()
      if (data) setEvent(data)
    }
    loadEvent()
  }, [])

  if (!event) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando festa...</div>

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      
      {/* Banner Imersivo */}
      <div className="w-full h-[60vh] bg-purple-900 relative overflow-hidden">
        {/* Gradiente para o texto ficar legível */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        {/* Título e Infos no centro/fundo */}
        <div className="absolute bottom-0 w-full p-8 flex flex-col items-center text-center pb-20">
            <p className="text-purple-400 font-bold tracking-widest uppercase text-sm mb-2">Próximo Evento</p>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none">{event.title}</h1>
            <div className="flex gap-4 text-sm font-bold text-gray-300 uppercase">
                <span>📅 {new Date(event.date).toLocaleDateString('pt-BR')}</span>
                <span>📍 Rio Preto</span>
            </div>
        </div>
      </div>

      {/* Área de Compra */}
      <div className="w-full max-w-md px-6 -mt-10 z-20 pb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center">
          <p className="text-gray-400 mb-6 text-sm">Garanta seu lugar antes que os lotes virem.</p>
          
          <Link href={`/checkout?event=${encodeURIComponent(event.title)}`}>
            <button className="w-full bg-green-500 hover:bg-green-400 text-black font-black uppercase py-4 rounded-lg text-lg transition-transform active:scale-95 shadow-lg shadow-green-500/20">
              GARANTIR INGRESSO
            </button>
          </Link>
          
          <p className="text-xs text-gray-600 mt-4">Compra 100% Segura • A Caverna</p>
        </div>
      </div>
    </div>
  )
}