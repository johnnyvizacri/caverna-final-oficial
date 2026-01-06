'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function GerenciarEventos() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  
  // Formulario
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Proteção de Login
  useEffect(() => {
    const isAuth = localStorage.getItem('staff_auth')
    if (isAuth !== 'true') {
      router.push('/staff')
    } else {
      loadEvents()
    }
  }, [])

  async function loadEvents() {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
    if (data) setEvents(data)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Primeiro desativa qualquer outro evento ativo (para garantir que só tem 1 ativo na Home)
    await supabase.from('events').update({ status: 'archived' }).neq('status', 'archived')

    // Cria o novo evento
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({ title, date, status: 'active', location: 'A Caverna' })
      .select()
      .single()

    if (error) {
      alert('Erro ao criar evento')
      console.error(error)
    } else {
      // Cria Lotes Padrão
      await supabase.from('event_batches').insert([
        { event_id: newEvent.id, name: '1º Lote Promocional', price: 15.00, total_tickets: 50 },
        { event_id: newEvent.id, name: '2º Lote', price: 20.00, total_tickets: 100 },
        { event_id: newEvent.id, name: '3º Lote Final', price: 30.00, total_tickets: 100 }
      ])
      
      alert('Evento Criado com Sucesso!')
      setTitle('')
      setDate('')
      loadEvents()
    }
    setLoading(false)
  }

  // --- FUNÇÃO DE EXCLUIR ROBUSTA ---
  async function handleDelete(id: string) {
    const confirmacao = window.confirm('TEM CERTEZA? Isso vai apagar o evento e TODOS os ingressos vendidos. Não tem volta.')
    
    if (confirmacao) {
      // 1. Apaga Lotes
      await supabase.from('event_batches').delete().eq('event_id', id)
      // 2. Apaga Ingressos
      await supabase.from('tickets').delete().eq('event_id', id)
      // 3. Apaga Evento
      const { error } = await supabase.from('events').delete().eq('id', id)
      
      if (error) {
        alert('Erro ao excluir. Verifique se liberou o DELETE no SQL do Supabase.')
        console.error(error)
      } else {
        alert('Evento excluído.')
        loadEvents()
        router.refresh() // Força atualização do site
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6 pb-20">
      <div className="max-w-md mx-auto">
        <button onClick={() => router.push('/staff')} className="text-xs font-bold text-gray-500 mb-4 flex items-center">
             ← VOLTAR AO MENU
        </button>
        
        <h1 className="text-3xl font-black uppercase mb-6 tracking-tighter">Eventos</h1>

        {/* CARD DE CRIAÇÃO */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-8 border border-gray-200">
          <h2 className="font-bold text-lg mb-4 text-purple-600 uppercase border-b pb-2">Novo Evento</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">NOME DA FESTA</label>
              <input 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full border-2 border-gray-200 p-3 rounded-lg font-bold outline-none focus:border-purple-500 transition-colors" 
                placeholder="Ex: Baile da Caverna" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">DATA E HORA</label>
              <input 
                required 
                type="datetime-local" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-purple-500 transition-colors" 
              />
            </div>
            <button 
                disabled={loading} 
                className="w-full bg-black text-white font-black uppercase py-4 rounded-lg hover:bg-gray-800 transition-transform active:scale-95"
            >
              {loading ? 'Criando...' : 'Publicar Evento'}
            </button>
          </form>
        </div>

        {/* LISTA DE EXISTENTES */}
        <h2 className="font-bold text-xs text-gray-400 mb-3 uppercase tracking-widest">Eventos Ativos</h2>
        <div className="space-y-3">
          {events.length === 0 && <p className="text-gray-400 text-sm">Nenhum evento encontrado.</p>}
          
          {events.map(evt => (
            <div key={evt.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-green-500">
              <div>
                <p className="font-bold text-lg leading-none">{evt.title}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase font-bold">
                    {new Date(evt.date).toLocaleDateString('pt-BR')} • {evt.status}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(evt.id)} 
                className="text-red-600 hover:text-white hover:bg-red-600 text-[10px] font-bold border border-red-200 px-3 py-2 rounded transition-colors uppercase"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}