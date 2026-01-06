'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function MeusEventos() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica login
    if (localStorage.getItem('staff_auth') !== 'true') router.push('/staff')
    loadData()
  }, [])

  async function loadData() {
    // Carrega eventos E seus lotes (para somar as vendas)
    const { data } = await supabase
      .from('events')
      .select('*, event_batches(*)')
      .order('date', { ascending: false })
    
    if (data) setEvents(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('ATENÇÃO: Isso apagará o evento e TODAS as vendas dele. Continuar?')) return

    try {
      // Cascata manual de exclusão
      await supabase.from('tickets').delete().eq('event_id', id)
      await supabase.from('event_batches').delete().eq('event_id', id)
      await supabase.from('events').delete().eq('id', id)
      
      alert('Evento excluído.')
      loadData()
    } catch (error) {
      alert('Erro ao excluir.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <button onClick={() => router.push('/staff')} className="text-xs font-bold text-gray-500 uppercase hover:text-black mb-1">← Voltar ao Menu</button>
                <h1 className="text-3xl font-black text-blue-600 uppercase tracking-tighter">Meus Eventos</h1>
            </div>
            <Link href="/staff/novo-evento">
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 uppercase text-sm">
                    + Criar Evento
                </button>
            </Link>
        </div>

        {/* LISTA DE EVENTOS (ESTILO SYMPLA) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Cabeçalho da Tabela */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Status</div>
                <div className="col-span-4">Evento</div>
                <div className="col-span-2">Quando</div>
                <div className="col-span-3">Ingressos (Vendas)</div>
                <div className="col-span-2 text-right">Ações</div>
            </div>

            {loading && <div className="p-10 text-center text-gray-400">Carregando eventos...</div>}

            {!loading && events.length === 0 && (
                <div className="p-10 text-center text-gray-400">Nenhum evento criado ainda.</div>
            )}

            {/* Linhas da Tabela */}
            {events.map((evt) => {
                // Cálculos de Vendas
                let sold = 0
                let total = 0
                evt.event_batches.forEach((b: any) => {
                    sold += b.sold_tickets
                    total += b.total_tickets
                })
                const percent = total > 0 ? Math.round((sold / total) * 100) : 0
                const isActive = evt.status === 'active'

                return (
                    <div key={evt.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 border-b border-gray-100 items-center hover:bg-blue-50/30 transition-colors">
                        
                        {/* Status */}
                        <div className="col-span-1 flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-300'}`}></div>
                            <span className="md:hidden text-xs font-bold uppercase">{isActive ? 'Publicado' : 'Arquivado'}</span>
                        </div>

                        {/* Evento */}
                        <div className="col-span-12 md:col-span-4">
                            <p className="font-bold text-gray-800 text-lg leading-tight">{evt.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{evt.location}</p>
                        </div>

                        {/* Quando */}
                        <div className="col-span-6 md:col-span-2 text-sm text-gray-600 font-medium">
                            {new Date(evt.date).toLocaleDateString('pt-BR')}
                            <br/>
                            <span className="text-xs text-gray-400">{new Date(evt.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>

                        {/* Barra de Progresso (Ingressos) */}
                        <div className="col-span-12 md:col-span-3">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-blue-600">{sold} vendidos</span>
                                <span className="text-gray-400">{total} total</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="col-span-12 md:col-span-2 flex justify-end gap-2">
                            <Link href={`/staff/editar?id=${evt.id}`}>
                                <button className="border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors uppercase">
                                    Editar
                                </button>
                            </Link>
                            <button 
                                onClick={() => handleDelete(evt.id)}
                                className="border border-red-100 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                                title="Excluir Evento"
                            >
                                🗑️
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