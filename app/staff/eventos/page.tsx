'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function MeusEventos() {
  const [events, setEvents] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
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
      .order('date', { ascending: false })
    
    if (data) setEvents(data)
  }

  // FUNÇÃO DE EXCLUIR (NOVA)
  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja EXCLUIR este evento? Essa ação não tem volta.")) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (!error) {
      setEvents(events.filter(e => e.id !== id)) // Remove da tela na hora
      alert("Evento excluído com sucesso.")
    } else {
      alert("Erro ao excluir evento.")
    }
  }

  async function toggleStatus(event: any) {
    const newStatus = event.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', event.id)
    if (!error) {
      setEvents(events.map(e => e.id === event.id ? { ...e, status: newStatus } : e))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase text-gray-800">Meus Eventos</h1>
            <p className="text-xs text-gray-500">Gerencie seus eventos ativos e passados</p>
          </div>
          
          <div className="flex gap-3">
             <Link href="/staff">
              <button className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border rounded hover:bg-gray-50">
                ← Voltar
              </button>
            </Link>
            {/* BOTÃO CRIAR NOVO (RESTAURADO) */}
            <Link href="/staff/criar">
              <button className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-md">
                + Novo Evento
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">Status</div>
            <div className="col-span-4">Evento</div>
            <div className="col-span-3">Vendas</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          {events.map((event) => {
            const capacity = event.capacity || 100;
            const sold = event.sold || 0;
            const percentage = Math.min((sold / capacity) * 100, 100);

            return (
              <div key={event.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
                
                {/* Status */}
                <div className="col-span-1 flex items-center gap-2 cursor-pointer" onClick={() => toggleStatus(event)}>
                  <div className={`w-3 h-3 rounded-full ${event.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>

                {/* Nome */}
                <div className="col-span-4 font-bold text-gray-800 truncate">
                  {event.title}
                </div>

                {/* Barra de Vendas */}
                <div className="col-span-3 pr-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div 
                            className={`h-2.5 rounded-full ${percentage >= 100 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold flex justify-between">
                        <span>{sold} vendidos</span>
                        <span>{Math.round(percentage)}%</span>
                    </div>
                </div>

                {/* Data */}
                <div className="col-span-2 text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString('pt-BR')}
                </div>

                {/* Ações (Com EXCLUIR) */}
                <div className="col-span-2 flex justify-end gap-2">
                  <Link href={`/staff/editar/${event.id}`}>
                    <button className="border border-blue-500 text-blue-500 px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-blue-50">
                      Editar
                    </button>
                  </Link>
                  
                  {/* BOTÃO EXCLUIR (NOVO) */}
                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-red-200"
                    title="Excluir Evento"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}