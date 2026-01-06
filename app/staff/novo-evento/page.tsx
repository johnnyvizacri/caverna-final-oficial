'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function GerenciarEventos() {
  const router = useRouter()
  
  const [events, setEvents] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Verifica se é Staff
  useEffect(() => {
    if (localStorage.getItem('staff_auth') !== 'true') {
      router.push('/staff')
    } else {
      loadEvents()
    }
  }, [])

  async function loadEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
    
    if (data) setEvents(data)
    if (error) console.error("Erro ao carregar eventos:", error)
  }

  // --- CRIAR EVENTO ---
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
        // 1. Arquiva eventos anteriores (opcional)
        await supabase.from('events').update({ status: 'archived' }).neq('status', 'archived')

        // 2. Cria o Evento
        const { data: newEvent, error: eventError } = await supabase
            .from('events')
            .insert({ 
                title, 
                date, 
                status: 'active', 
                location: 'A Caverna - Rio Preto' 
            })
            .select()
            .single()

        if (eventError) throw new Error('Erro ao criar evento: ' + eventError.message)
        if (!newEvent) throw new Error('Evento criado mas sem retorno de dados.')

        // 3. Cria os Lotes
        const { error: batchError } = await supabase.from('event_batches').insert([
            { event_id: newEvent.id, name: '1º Lote Promocional', price: 15.00, total_tickets: 50 },
            { event_id: newEvent.id, name: '2º Lote', price: 20.00, total_tickets: 100 },
            { event_id: newEvent.id, name: '3º Lote Final', price: 30.00, total_tickets: 100 }
        ])

        if (batchError) throw new Error('Erro ao criar lotes (Verifique se rodou o SQL): ' + batchError.message)

        // Sucesso
        alert('✅ Evento criado com sucesso!')
        setTitle('')
        setDate('')
        loadEvents()

    } catch (err: any) {
        alert('❌ FALHA: ' + err.message)
        console.error(err)
    } finally {
        setLoading(false)
    }
  }

  // --- EXCLUIR EVENTO ---
  async function handleDelete(id: string) {
    if (!confirm('ATENÇÃO: Isso apagará o evento, os lotes e TODOS os ingressos vendidos.\n\nConfirmar exclusão?')) return

    try {
        // Apaga na ordem certa para não dar erro de chave estrangeira
        await supabase.from('tickets').delete().eq('event_id', id)
        await supabase.from('event_batches').delete().eq('event_id', id)
        
        const { error } = await supabase.from('events').delete().eq('id', id)
        
        if (error) throw error
        
        alert('Evento excluído.')
        loadEvents()
        
    } catch (err: any) {
        alert('Erro ao excluir: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6 pb-20">
      <div className="max-w-md mx-auto">
        
        <button 
            onClick={() => router.push('/staff')} 
            className="mb-6 flex items-center text-xs font-bold text-gray-500 hover:text-black uppercase"
        >
            ← Voltar ao Menu Staff
        </button>

        <h1 className="text-2xl font-black uppercase mb-6">Gestão de Eventos</h1>

        {/* Formulário de Criação */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-10">
            <h2 className="font-bold text-sm text-purple-600 uppercase mb-4 tracking-widest">Novo Evento</h2>
            <form onSubmit={handleCreate} className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nome da Festa</label>
                    <input 
                        required 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        className="w-full border-2 border-gray-100 p-3 rounded-lg font-bold text-lg focus:border-purple-500 outline-none" 
                        placeholder="Ex: Baile do Havaí" 
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Data e Hora</label>
                    <input 
                        required 
                        type="datetime-local" 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-purple-500 outline-none" 
                    />
                </div>
                <button 
                    disabled={loading} 
                    className="w-full bg-black text-white font-black uppercase py-4 rounded-lg hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
                >
                    {loading ? 'Criando...' : 'Publicar Evento'}
                </button>
            </form>
            <p className="text-[10px] text-gray-400 mt-3 text-center">* Cria automaticamente 3 lotes de ingressos.</p>
        </div>

        {/* Lista de Eventos */}
        <h3 className="font-bold text-xs text-gray-400 uppercase mb-4 tracking-widest border-b pb-2">Eventos Registrados</h3>
        
        <div className="space-y-3">
            {events.length === 0 && <p className="text-gray-400 text-center text-sm py-4">Nenhum evento encontrado.</p>}
            
            {events.map(evt => (
                <div key={evt.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group hover:border-gray-300 transition-colors">
                    <div>
                        <p className="font-bold text-lg leading-tight uppercase">{evt.title}</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                            {new Date(evt.date).toLocaleDateString('pt-BR')} • {evt.status === 'active' ? <span className="text-green-500">ATIVO</span> : 'Arquivado'}
                        </p>
                    </div>
                    <button 
                        onClick={() => handleDelete(evt.id)} 
                        className="bg-red-50 text-red-500 text-[10px] font-bold px-3 py-2 rounded border border-red-100 hover:bg-red-500 hover:text-white transition-colors uppercase"
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