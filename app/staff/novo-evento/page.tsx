'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function CriarEventoSympla() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // ESTADOS DO FORMULÁRIO
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('A Caverna - Rio Preto')
  const [description, setDescription] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')

  // ESTADO DOS INGRESSOS (Dinâmico igual Sympla)
  const [batches, setBatches] = useState([
    { name: 'Ingresso Antecipado', price: '20.00', amount: '100' }
  ])

  // Verifica Login
  useEffect(() => {
    if (localStorage.getItem('staff_auth') !== 'true') router.push('/staff')
  }, [])

  // --- FUNÇÕES DE INGRESSO ---
  function addBatch() {
    setBatches([...batches, { name: '', price: '', amount: '' }])
  }

  function removeBatch(index: number) {
    const newBatches = batches.filter((_, i) => i !== index)
    setBatches(newBatches)
  }

  function updateBatch(index: number, field: string, value: string) {
    const newBatches = [...batches]
    // @ts-ignore
    newBatches[index][field] = value
    setBatches(newBatches)
  }

  // --- SALVAR TUDO ---
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Cria o Evento
      const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          date,
          location,
          description,
          image_url: bannerUrl, // Salva o link da imagem se tiver
          status: 'active'
        })
        .select()
        .single()

      if (eventError) throw eventError

      // 2. Prepara os Lotes para salvar
      const formattedBatches = batches.map(b => ({
        event_id: newEvent.id,
        name: b.name || 'Ingresso Geral',
        price: parseFloat(b.price.replace(',', '.')) || 0,
        total_tickets: parseInt(b.amount) || 0
      }))

      // 3. Salva os Lotes
      const { error: batchError } = await supabase.from('event_batches').insert(formattedBatches)
      
      if (batchError) throw batchError

      alert('✅ Evento publicado com sucesso!')
      router.push('/staff') // Volta pro menu

    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black pb-20">
      
      {/* TOPO ESTILO SYMPLA */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 uppercase tracking-tight">Criar Evento</h1>
        <button onClick={() => router.push('/staff')} className="text-sm font-bold text-gray-500 hover:text-black">CANCELAR</button>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-8">

        <form onSubmit={handleCreate}>
            
            {/* 1. INFORMAÇÕES BÁSICAS */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                    <h2 className="text-xl font-bold text-gray-800">Informações básicas</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Nome do evento *</label>
                        <input 
                            required 
                            value={title} 
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ex: Baile da Caverna - Edição Neon" 
                            className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold text-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Link do Banner (URL da Imagem)</label>
                        <input 
                            value={bannerUrl} 
                            onChange={e => setBannerUrl(e.target.value)}
                            placeholder="https://..." 
                            className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* 2. DATA E HORÁRIO */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mt-6">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                    <h2 className="text-xl font-bold text-gray-800">Data e Local</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Data de início *</label>
                        <input 
                            required
                            type="datetime-local"
                            value={date} 
                            onChange={e => setDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-1">Local *</label>
                        <input 
                            required
                            value={location} 
                            onChange={e => setLocation(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 bg-gray-50"
                        />
                    </div>
                </div>
            </div>

            {/* 3. DESCRIÇÃO */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mt-6">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                    <h2 className="text-xl font-bold text-gray-800">Descrição do evento</h2>
                </div>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descreva as atrações, regras e detalhes da festa..."
                    className="w-full h-32 border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 resize-none"
                ></textarea>
            </div>

            {/* 4. INGRESSOS (Igual Sympla) */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mt-6 border-l-4 border-l-blue-600">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">4</span>
                    <h2 className="text-xl font-bold text-gray-800">Ingressos</h2>
                </div>

                <div className="space-y-4">
                    {batches.map((batch, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nome do Ingresso</label>
                                <input 
                                    value={batch.name}
                                    onChange={e => updateBatch(index, 'name', e.target.value)}
                                    placeholder="Ex: 1º Lote"
                                    className="w-full border border-gray-300 rounded p-2 font-bold"
                                />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="text-xs font-bold text-gray-500 uppercase">Preço (R$)</label>
                                <input 
                                    type="number"
                                    value={batch.price}
                                    onChange={e => updateBatch(index, 'price', e.target.value)}
                                    placeholder="0,00"
                                    className="w-full border border-gray-300 rounded p-2"
                                />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="text-xs font-bold text-gray-500 uppercase">Qtde.</label>
                                <input 
                                    type="number"
                                    value={batch.amount}
                                    onChange={e => updateBatch(index, 'amount', e.target.value)}
                                    placeholder="100"
                                    className="w-full border border-gray-300 rounded p-2"
                                />
                            </div>
                            {batches.length > 1 && (
                                <button type="button" onClick={() => removeBatch(index)} className="text-red-500 text-xs font-bold p-3 hover:bg-red-100 rounded">
                                    X
                                </button>
                            )}
                        </div>
                    ))}

                    <button 
                        type="button"
                        onClick={addBatch}
                        className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        + Adicionar outro tipo de ingresso
                    </button>
                </div>
            </div>

            {/* BOTÃO FINAL */}
            <div className="mt-8 flex justify-end">
                <button 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    {loading ? 'PUBLICANDO...' : 'PUBLICAR EVENTO'}
                </button>
            </div>

        </form>

        <p className="text-center text-gray-400 text-xs mt-10">Painel Administrativo Caverna • Baseado no layout Sympla</p>
      </div>
    </div>
  )
}