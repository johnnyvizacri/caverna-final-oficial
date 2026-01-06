'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function EditarConteudo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('id') // Pega o ID da URL (?id=...)

  const [loading, setLoading] = useState(false)
  const [verificando, setVerificando] = useState(true)
  
  // Campos do Formulário
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [batches, setBatches] = useState<any[]>([])

  useEffect(() => {
    // 1. Proteção de Login
    if (localStorage.getItem('staff_auth') !== 'true') {
      router.push('/staff')
      return
    }

    // 2. Proteção de ID (Se não tiver ID, volta pra lista)
    if (!eventId) {
      alert('Evento não identificado!')
      router.push('/staff/eventos')
      return
    }

    // Se passou, carrega os dados
    loadEventData(eventId)
  }, [eventId])

  async function loadEventData(id: string) {
    try {
        // Carrega Evento
        const { data: evt, error } = await supabase.from('events').select('*').eq('id', id).single()
        
        if (error || !evt) {
            alert('Evento não encontrado no banco.')
            router.push('/staff/eventos')
            return
        }

        setTitle(evt.title)
        
        // Formata data para o input do HTML (YYYY-MM-DDTHH:MM)
        if (evt.date) {
            const d = new Date(evt.date)
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
            setDate(d.toISOString().slice(0, 16))
        }
        
        setLocation(evt.location || '')
        setDescription(evt.description || '')
        setBannerUrl(evt.image_url || '')

        // Carrega Lotes
        const { data: btc } = await supabase
            .from('event_batches')
            .select('*')
            .eq('event_id', id)
            .order('price', { ascending: true })
        
        if (btc) setBatches(btc)

    } catch (err) {
        console.error(err)
    } finally {
        setVerificando(false)
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!eventId) return // Segurança extra

    setLoading(true)

    try {
        const { error } = await supabase.from('events').update({
            title,
            date,
            location,
            description,
            image_url: bannerUrl
        }).eq('id', eventId)

        if (error) throw error

        alert('✅ Evento atualizado com sucesso!')
        router.push('/staff/eventos') // Volta para a lista

    } catch (error: any) {
        alert('Erro ao atualizar: ' + error.message)
    } finally {
        setLoading(false)
    }
  }

  if (verificando) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Carregando dados...</div>

  return (
    <div className="min-h-screen bg-gray-50 text-black pb-20">
      
      {/* Topo Fixo */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 uppercase">Editar Evento</h1>
        <button 
            type="button" 
            onClick={() => router.push('/staff/eventos')} 
            className="text-xs font-bold text-gray-500 hover:text-black uppercase"
        >
            Cancelar
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
            
            {/* Campos Principais */}
            <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nome do Evento</label>
                <input 
                    required 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full border-2 border-gray-100 p-3 rounded-lg font-bold text-lg outline-none focus:border-blue-500 transition-colors" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Data e Hora</label>
                    <input 
                        type="datetime-local" 
                        required 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        className="w-full border-2 border-gray-100 p-3 rounded-lg outline-none focus:border-blue-500 transition-colors" 
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Local</label>
                    <input 
                        required 
                        value={location} 
                        onChange={e => setLocation(e.target.value)} 
                        className="w-full border-2 border-gray-100 p-3 rounded-lg outline-none focus:border-blue-500 transition-colors" 
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Link do Banner (URL)</label>
                <input 
                    value={bannerUrl} 
                    onChange={e => setBannerUrl(e.target.value)} 
                    placeholder="https://..."
                    className="w-full border-2 border-gray-100 p-3 rounded-lg outline-none focus:border-blue-500 transition-colors text-sm" 
                />
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Descrição</label>
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full h-32 border-2 border-gray-100 p-3 rounded-lg outline-none focus:border-blue-500 resize-none transition-colors" 
                />
            </div>

            {/* Aviso sobre Lotes */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex gap-3 items-start">
                <span className="text-xl">⚠️</span>
                <div>
                    <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Atenção aos Lotes</p>
                    <p className="text-xs text-yellow-600">
                        Para evitar erros financeiros, não é possível alterar o preço de lotes já criados por aqui. 
                        Se precisar mudar, exclua o evento e crie novamente.
                    </p>
                </div>
            </div>

            {/* Lista de Lotes (Apenas visualização) */}
            <div className="space-y-2 opacity-70">
                {batches.map(b => (
                    <div key={b.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100 text-sm">
                        <span className="font-bold text-gray-600">{b.name}</span>
                        <span className="font-mono">R$ {b.price.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <button 
                disabled={loading} 
                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-500 transition-transform active:scale-95 uppercase shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Salvando Alterações...' : 'Salvar Alterações'}
            </button>
        </form>
      </div>
    </div>
  )
}

// Suspense é obrigatório no Next.js quando usamos useSearchParams
export default function EditarPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Carregando editor...</div>}>
      <EditarConteudo />
    </Suspense>
  )
}