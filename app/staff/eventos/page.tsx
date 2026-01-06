'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function MeusEventos() {
  const [events, setEvents] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // Segurança: Verifica se está logado
    if (!localStorage.getItem('staff_auth')) {
      router.push('/staff')
      return
    }
    loadEvents()
  }, [])

  async function loadEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false }) // Mais recentes primeiro
    
    if (data) setEvents(data)
  }

  // Função para Ligar/Desligar evento na Home
  async function toggleStatus(event: any) {
    const newStatus = event.status === 'active' ? 'inactive' : 'active'
    
    const { error } = await supabase
      .from('events')
      .update({ status: newStatus })
      .eq('id', event.id)

    if (!error) {
      // Atualiza a lista localmente para ver a mudança na hora
      setEvents(events.map(e => e.id === event.id ? { ...e, status: newStatus } : e))
    } else {
      alert('Erro ao atualizar status.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black uppercase text-gray-800">Meus Eventos</h1>
          <Link href="/staff">
            <button className="text-sm font-bold text-gray-500 hover:text-black">← Voltar ao Menu</button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cabeçalho da Tabela */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">Status</div>
            <div className="col-span-5">Evento</div>
            <div className="col-span-3">Data</div>
            <div className="col-span-3 text-right">Ações</div>
          </div>

          {/* Linhas da Tabela */}
          {events.map((event) => (
            <div key={event.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
              
              {/* Status (Bolinha) */}
              <div className="col-span-1 flex items-center gap-2 cursor-pointer" onClick={() => toggleStatus(event)} title="Clique para mudar">
                <div className={`w-3 h-3 rounded-full ${event.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-[10px] font-bold text-gray-400 hidden md:block">
                  {event.status === 'active' ? 'NO AR' : 'OFF'}
                </span>
              </div>

              {/* Nome */}
              <div className="col-span-5 font-bold text-gray-800 truncate">
                {event.title}
              </div>

              {/* Data */}
              <div className="col-span-3 text-sm text-gray-600">
                {new Date(event.date).toLocaleDateString('pt-BR')}
              </div>

              {/* Botões */}
              <div className="col-span-3 flex justify-end gap-2">
                {/* Botão Editar */}
                <Link href={`/staff/editar/${event.id}`}>
                  <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded text-xs font-bold uppercase hover:bg-blue-50">
                    Editar
                  </button>
                </Link>
                
                {/* Botão Ativar/Desativar */}
                <button 
                  onClick={() => toggleStatus(event)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase text-white transition-colors ${
                    event.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {event.status === 'active' ? 'Pausar' : 'Publicar'}
                </button>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="p-10 text-center text-gray-400">Nenhum evento encontrado.</div>
          )}
        </div>
      </div>
    </div>
  )
}