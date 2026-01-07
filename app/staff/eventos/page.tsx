'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase' // Verifique se o caminho ../ está correto

export default function GerenciarEventos() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Verifica Login
    if (typeof window !== 'undefined' && localStorage.getItem('staff_auth') !== 'true') {
      router.push('/staff')
      return
    }
    
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    // Busca eventos ordenados pela data (mais recentes primeiro)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Erro ao buscar eventos:', error)
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  // FUNÇÃO DE DELETAR
  async function handleDelete(id: string, title: string) {
    const confirm = window.confirm(`Tem certeza que deseja apagar o evento "${title}"?\nIsso apagará também os ingressos vendidos!`)
    
    if (confirm) {
      try {
        // Deleta o evento (o Supabase deve deletar os ingressos em cascata se configurado, ou deletamos só o evento)
        const { error } = await supabase.from('events').delete().eq('id', id)
        
        if (error) throw error

        alert('Evento deletado com sucesso!')
        // Remove da lista visualmente sem precisar recarregar a página
        setEvents(events.filter(event => event.id !== id))

      } catch (error: any) {
        alert('Erro ao deletar: ' + error.message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">MEUS EVENTOS</h1>
            <p className="text-xs text-gray-500 font-medium">Gerenciamento do A Caverna</p>
        </div>
        
        <div className="flex gap-3">
             <button 
                onClick={() => router.push('/staff')}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
            >
                VOLTAR
            </button>
            <Link 
                href="/staff/novo-evento" 
                className="bg-black text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-transform active:scale-95 shadow-lg flex items-center gap-2"
            >
                <span>+</span> NOVO EVENTO
            </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        
        {loading ? (
            <div className="text-center py-20 text-gray-400">Carregando eventos...</div>
        ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 mb-4">Nenhum evento criado ainda.</p>
                <Link href="/staff/novo-evento" className="text-blue-600 font-bold underline">Criar o primeiro</Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                        
                        {/* Imagem do Evento */}
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                            {event.image_url ? (
                                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-4xl bg-gray-100">?</div>
                            )}
                            
                            {/* Badge de Data */}
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                {new Date(event.date).toLocaleDateString('pt-BR')}
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 leading-tight mb-1">{event.title}</h2>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                                    📍 {event.location || 'Local não definido'}
                                </p>
                            </div>

                            {/* Botões de Ação */}
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => router.push(`/staff/editar/${event.id}`)}
                                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                >
                                    {/* Ícone Lápis SVG */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    EDITAR
                                </button>

                                <button 
                                    onClick={() => handleDelete(event.id, event.title)}
                                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                >
                                    {/* Ícone Lixeira SVG */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    EXCLUIR
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}