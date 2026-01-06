'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from './lib/supabase'

export default function Home() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    async function loadEvents() {
      // Carrega TODOS os eventos ativos (não só um)
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
      
      {/* HEADER / NAV */}
      <header className="flex flex-col md:flex-row justify-between items-center p-6 md:p-10 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="mb-4 md:mb-0">
          <div className="border-4 border-black p-2 rounded-xl inline-block">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tighter">
              A Caverna<br/>
              <span className="text-sm tracking-widest block text-center">Rio Preto</span>
            </h1>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex gap-4 md:gap-8 items-center font-bold uppercase text-sm md:text-base tracking-tight">
          <a href="#events" className="hover:underline decoration-4 underline-offset-4">Ingressos</a>
          
          <a 
            href="https://www.google.com/maps/search/?api=1&query=Avenida+da+Saudade,4066,São+José+do+Rio+Preto" 
            target="_blank" 
            className="hover:underline decoration-4 underline-offset-4"
          >
            Localização
          </a>
          
          <Link href="/minha-conta">
            <button className="bg-white text-black px-6 py-2 rounded-full font-black hover:scale-105 transition-transform shadow-lg">
              Minha Conta
            </button>
          </Link>
        </nav>
      </header>

      {/* LISTA DE EVENTOS */}
      <main id="events" className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        
        {events.length === 0 && (
          <div className="text-center py-20">
            <p className="font-bold text-xl opacity-50">Carregando a agenda...</p>
          </div>
        )}

        {events.map((event) => (
          <div key={event.id} className="group relative flex flex-col md:flex-row items-stretch bg-transparent md:h-64 transition-transform hover:-translate-y-1">
            
            {/* Foto do Evento (Esquerda) */}
            <div className="md:w-1/3 bg-black rounded-3xl md:rounded-r-none relative overflow-hidden h-48 md:h-auto border-4 border-transparent group-hover:border-black transition-colors">
              {/* Se tiver imagem no banco, usaria aqui. Como não tem, fica um placeholder chique */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <span className="text-gray-700 font-black text-4xl uppercase opacity-20 rotate-12">FOTO</span>
              </div>
              
              {/* Data Flutuante na Foto */}
              <div className="absolute top-4 left-4 bg-white text-black p-2 rounded-lg text-center leading-none shadow-lg">
                <span className="block text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="block text-xl font-black">{new Date(event.date).getDate()}</span>
              </div>
            </div>

            {/* Informações (Direita) */}
            <div className="md:w-2/3 bg-black text-white rounded-3xl md:rounded-l-none p-8 md:pl-10 flex flex-col justify-center relative shadow-2xl">
              
              <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-widest mb-2">
                <span>📍 Rio Preto</span>
                <span>•</span>
                <span>{new Date(event.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}H</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 leading-none text-white group-hover:text-yellow-400 transition-colors">
                {event.title}
              </h2>
              
              <p className="text-gray-400 font-bold uppercase tracking-tight mb-8">
                {event.description || 'O melhor da noite em Rio Preto'}
              </p>

              <div className="mt-auto">
                <Link href={`/checkout?event=${encodeURIComponent(event.title)}`}>
                  <button className="bg-white text-black hover:bg-yellow-400 font-black uppercase px-8 py-3 rounded-full text-sm md:text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)]">
                    Garantir Ingressos
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}

      </main>

      {/* RODAPÉ */}
      <footer className="text-center p-10 mt-10 opacity-60 font-bold text-xs uppercase tracking-widest">
        Compra 100% Segura • A Caverna Rio Preto®
      </footer>
    </div>
  )
}