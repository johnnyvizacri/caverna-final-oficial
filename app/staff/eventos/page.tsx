'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function MeusEventos() {
  const [events, setEvents] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    // Segurança básica
    if (!localStorage.getItem('staff_auth')) {
      router.push('/staff')
      return
    }
    loadEvents()
  }, [])

  async function loadEvents() {
    // IMPORTANTE: Estou assumindo que suas colunas no banco chamam 'capacity' (capacidade) e 'sold' (vendidos)
    // Se tiver outro nome, avise que a gente troca aqui
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
    
    if (data) setEvents(data)
  }

  async function toggleStatus(event: any) {
    const newStatus = event.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', event.id)
    if (!error) {
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
          {/* Cabeçalho */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">Status</div>
            <div className="col-span-4">Evento</div>
            <div className="col-span-3">Vendas</div> {/* Coluna Nova */}
            <div className="col-span-2">Data</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          {/* Lista */}
          {events.map((event) => {
            // Cálculos da Barra
            const capacity = event.capacity || 100; // Valor padrão se estiver vazio
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

                {/* BARRA DE VENDAS (NOVO) */}
                <div className="col-span-3 pr-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div 
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
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

                {/* Botões */}
                <div className="col-span-2 flex justify-end gap-2">
                  <Link href={`/staff/editar/${event.id}`}>
                    <button className="border border-blue-500 text-blue-500 px-2 py-1 rounded text-[10px] font-bold uppercase hover:bg-blue-50">
                      Editar
                    </button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}