'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image' // <-- Importante: Traz a ferramenta de imagem
import { supabase } from './lib/supabase'

export default function Home() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .order('date', { ascending: true })
      
      if (data) setEvents(data)
    }
    loadEvents()
  }, [])

  return (
    <div className="min-h-screen bg-[#FFA500] text-black font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center p-6 md:p-10 max-w-7xl mx-auto">
        
        {/* LOGO (Agora é imagem) */}
        <div className="mb-6 md:mb-0">
          {/* TROQUE 'logo-caverna.png' PELO NOME DO SEU ARQUIVO NA PASTA PUBLIC */}
          <Image 
            src="/logo-caverna.png" 
            alt="A Caverna Rio Preto" 
            width={50} // Ajuste a largura conforme necessário
            height={25} // Ajuste a altura conforme necessário
            className="object-contain hover:scale-105 transition-transform"
            priority // Carrega mais rápido por ser o logo principal
          />
        </div>

        <nav className="flex gap-6 md:gap-10 items-center font-bold uppercase text-sm md:text-base tracking-tight">
          <a href="#events" className="hover:underline decoration-4 underline-offset-4">Ingressos</a>
          <a href="https://www.google.com/maps/search/?api=1&query=Avenida+da+Saudade,4066,São+José+do+Rio+Preto" target="_blank" className="hover:underline decoration-4 underline-offset-4">Localização</a>
          <Link href="/minha-conta">
            <button className="bg-white text-black px-8 py-3 rounded-full font-black hover:scale-105 transition-transform shadow-lg">
              Minha Conta
            </button>
          </Link>
        </nav>
      </header>

      {/* LISTA DE EVENTOS (O resto continua igual) */}
      <main id="events" className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {events.length === 0 && (
          <div className="text-center py-20 opacity-50 font-bold text-xl">Carregando agenda...</div>
        )}

        {events.map((event) => (
          <div key={event.id} className="bg-black rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl transition-transform hover:-translate-y-2">
            <div className="md:w-[40%] relative bg-gray-900/80 h-80 md:h-auto flex items-center justify-center overflow-hidden">
              <span className="text-gray-800 font-black text-7xl uppercase -rotate-12 select-none opacity-50">FOTO</span>
              <div className="absolute top-6 left-6 bg-white text-black rounded-2xl p-4 text-center shadow-lg leading-tight">
                <span className="block text-sm font-bold uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' })}.</span>
                <span className="block text-4xl font-black">{new Date(event.date).getDate()}</span>
              </div>
            </div>
            <div className="md:w-[60%] p-10 md:p-14 flex flex-col justify-center items-start text-left bg-black">
              <div className="flex items-center gap-3 text-fuchsia-500 font-bold text-sm uppercase tracking-widest mb-4">
                <span>📍 Rio Preto</span>
                <span>•</span>
                <span>{new Date(event.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}H</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white uppercase leading-none mb-6 tracking-tighter">
                {event.title}
              </h2>
              <p className="text-gray-400 text-xl mb-12 leading-tight font-medium max-w-2xl">
                {event.description || 'A melhor noite de pop rock de Rio Preto.'}
              </p>
              <Link href={`/checkout?event=${encodeURIComponent(event.title)}`} className="w-full md:w-auto">
                <button className="w-full md:w-auto bg-white text-black font-black uppercase px-16 py-6 rounded-full text-xl hover:scale-105 transition-transform shadow-[0_10px_40px_-10px_rgba(255,255,255,0.5)]">
                  GARANTIR INGRESSOS
                </button>
              </Link>
            </div>
          </div>
        ))}
      </main>
      
      <footer className="text-center p-14 mt-10 opacity-70 font-bold text-sm uppercase tracking-widest">
        Compra 100% Segura • A Caverna Rio Preto®
      </footer>
    </div>
  )
}