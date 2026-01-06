'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function StaffMenu() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [activeEvents, setActiveEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Função Inteligente da Portaria
  async function handlePortariaClick() {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
    
    setLoading(false)

    if (!data || data.length === 0) {
      alert("Nenhum evento 'NO AR' encontrado hoje.")
      return
    }

    if (data.length === 1) {
      router.push(`/staff/checkin/${data[0].id}`)
    } else {
      setActiveEvents(data)
      setShowModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col items-center justify-center p-6 relative">
      
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-black uppercase text-center text-gray-800">Menu Staff</h1>
        
        {/* 1. BOTÃO PORTARIA */}
        <div onClick={handlePortariaClick} className="bg-white text-black p-6 rounded-2xl flex items-center gap-4 shadow-xl hover:scale-105 transition-transform cursor-pointer border-2 border-gray-200">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-full text-2xl">
            {loading ? '...' : '🎫'}
          </div>
          <div>
            <h3 className="font-black text-xl uppercase">Portaria / Check-in</h3>
            <p className="text-gray-600 text-xs">Validar ingressos</p>
          </div>
        </div>

        {/* 2. BOTÃO MEUS EVENTOS */}
        <Link href="/staff/eventos">
          <div className="bg-white text-black p-6 rounded-2xl flex items-center gap-4 shadow-xl hover:scale-105 transition-transform cursor-pointer border-2 border-gray-200">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full text-2xl">📋</div>
            <div>
              <h3 className="font-black text-xl uppercase">Meus Eventos</h3>
              <p className="text-gray-600 text-xs">Ver lista, vendas e editar</p>
            </div>
          </div>
        </Link>

        {/* 3. BOTÃO NOVO EVENTO (RESTAURADO) */}
        <Link href="/staff/criar">
          <div className="bg-white text-black p-6 rounded-2xl flex items-center gap-4 shadow-xl hover:scale-105 transition-transform cursor-pointer border-2 border-gray-200">
            <div className="bg-green-100 text-green-600 p-4 rounded-full text-2xl">✨</div>
            <div>
              <h3 className="font-black text-xl uppercase">Novo Evento</h3>
              <p className="text-gray-600 text-xs">Criar festa ou evento</p>
            </div>
          </div>
        </Link>

      </div>

      {/* MODAL (PORTARIA) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Escolha o Evento</h3>
              <button onClick={() => setShowModal(false)} className="text-red-500 font-bold">X</button>
            </div>
            <div className="p-2">
              {activeEvents.map(event => (
                <div 
                  key={event.id}
                  onClick={() => router.push(`/staff/checkin/${event.id}`)}
                  className="p-4 border-b last:border-0 hover:bg-purple-50 cursor-pointer flex justify-between items-center"
                >
                  <span className="font-bold text-gray-800">{event.title}</span>
                  <span className="text-purple-600 font-bold">Entrar →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}