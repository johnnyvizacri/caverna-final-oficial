'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

function EditarConteudo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('id')

  const [loading, setLoading] = useState(false)
  
  // Campos
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [batches, setBatches] = useState<any[]>([])

  useEffect(() => {
    if (localStorage.getItem('staff_auth') !== 'true') router.push('/staff')
    if (eventId) loadEventData(eventId)
  }, [eventId])

  async function loadEventData(id: string) {
    // 1. Pega Evento
    const { data: evt } = await supabase.from('events').select('*').eq('id', id).single()
    if (evt) {
        setTitle(evt.title)
        // Formata data para o input datetime-local
        const d = new Date(evt.date)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        setDate(d.toISOString().slice(0, 16))
        
        setLocation(evt.location)
        setDescription(evt.description || '')
        setBannerUrl(evt.image_url || '')
    }

    // 2. Pega Lotes
    const { data: btc } = await supabase.from('event_batches').select('*').eq('event_id', id).order('price', { ascending: true })
    if (btc) setBatches(btc)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
        // Atualiza Evento
        const { error } = await supabase.from('events').update({
            title,
            date,
            location,
            description,
            image_url: bannerUrl
        }).eq('id', eventId)

        if (error) throw error

        alert('✅ Evento atualizado com sucesso!')
        router.push('/staff/eventos')

    } catch (error: any) {
        alert('Erro ao atualizar: ' + error.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black pb-20">
      {/* Topo */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 uppercase">Editar Evento</h1>
        <button onClick={() => router.push('/staff/eventos')} className="text-sm font-bold text-gray-500 hover:text-black">CANCELAR</button>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
            
            {/* Campos Básicos */}
            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Nome do Evento</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-3 rounded-lg font-bold text-lg outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Data</label>
                    <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Local</label>
                    <input required value={location} onChange={e => setLocation(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Banner (URL)</label>
                <input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="w-full border p-3 rounded-lg outline-none focus:border-blue-500 text-sm" />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full h-32 border p-3 rounded-lg outline-none focus:border-blue-500 resize-none" />
            </div>

            {/* Visualização de Lotes (Apenas Leitura por Segurança) */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Lotes Atuais (Edição bloqueada p/ segurança financeira)</p>
                {batches.map(b => (
                    <div key={b.id} className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                        <span>{b.name}</span>
                        <span className="font-bold">R$ {b.price}</span>
                    </div>
                ))}
            </div>

            <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-500 transition-all uppercase shadow-lg">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </form>
      </div>
    </div>
  )
}

export default function EditarPage() {
  return <Suspense fallback={<div>Carregando...</div>}><EditarConteudo /></Suspense>
}