'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function NovoEvento() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Dados do Evento
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('23:00')
  const [description, setDescription] = useState('')

  // Dados dos Lotes (Começa com 1 lote vazio)
  const [batches, setBatches] = useState([
    { name: '1º Lote', price: '', quantity: '' }
  ])

  // Adicionar novo campo de lote dinamicamente
  function addBatch() {
    setBatches([...batches, { name: `${batches.length + 1}º Lote`, price: '', quantity: '' }])
  }

  // Atualizar dados de um lote específico
  function updateBatch(index: number, field: string, value: string) {
    const newBatches = [...batches]
    // @ts-ignore
    newBatches[index][field] = value
    setBatches(newBatches)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Desativar eventos antigos (Opcional: se quiser só 1 festa por vez)
      await supabase.from('events').update({ status: 'finished' }).eq('status', 'active')

      // 2. Criar o Evento Novo
      // Junta Data e Hora num formato ISO
      const fullDate = new Date(`${date}T${time}:00`)

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          description,
          date: fullDate.toISOString(),
          status: 'active' // Já nasce ativo
        })
        .select()
        .single()

      if (eventError) throw eventError

      // 3. Criar os Lotes vinculados a esse evento
      const batchesToInsert = batches.map(b => ({
        event_id: event.id,
        name: b.name,
        price: parseFloat(b.price.replace(',', '.')), // Converte "10,00" pra número
        total_tickets: parseInt(b.quantity),
        sold_tickets: 0
      }))

      const { error: batchError } = await supabase.from('event_batches').insert(batchesToInsert)
      if (batchError) throw batchError

      alert('✅ Evento e Lotes criados com sucesso!')
      router.push('/') // Vai pra home ver o resultado

    } catch (error) {
      console.error(error)
      alert('Erro ao criar evento. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6 pb-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black uppercase mb-6">Cadastrar Novo Evento</h1>
        
        <form onSubmit={handleCreate} className="space-y-6">
          
          {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-500 uppercase text-xs mb-4 border-b pb-2">1. Informações Básicas</h3>
            
            <label className="block text-sm font-bold mb-1">Nome do Evento</label>
            <input required type="text" placeholder="Ex: Summer Breeze" className="w-full bg-gray-50 border p-3 rounded-lg mb-4 outline-none focus:ring-2 ring-yellow-500" value={title} onChange={e => setTitle(e.target.value)} />

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Data</label>
                <input required type="date" className="w-full bg-gray-50 border p-3 rounded-lg outline-none focus:ring-2 ring-yellow-500" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="w-32">
                <label className="block text-sm font-bold mb-1">Horário</label>
                <input required type="time" className="w-full bg-gray-50 border p-3 rounded-lg outline-none focus:ring-2 ring-yellow-500" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>

            <label className="block text-sm font-bold mb-1">Descrição / Atrações</label>
            <textarea required rows={3} placeholder="Descreva as atrações..." className="w-full bg-gray-50 border p-3 rounded-lg outline-none focus:ring-2 ring-yellow-500" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          {/* SEÇÃO 2: LOTES / INGRESSOS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-500 uppercase text-xs mb-4 border-b pb-2">2. Ingressos (Lotes)</h3>
            <p className="text-xs text-gray-400 mb-4">Defina o preço e a quantidade. O link de pagamento será gerado automaticamente.</p>

            {batches.map((batch, index) => (
              <div key={index} className="flex gap-3 mb-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Nome do Lote</label>
                  <input type="text" value={batch.name} onChange={e => updateBatch(index, 'name', e.target.value)} className="w-full bg-white border p-2 rounded text-sm font-bold" />
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Qtd.</label>
                  <input type="number" placeholder="0" value={batch.quantity} onChange={e => updateBatch(index, 'quantity', e.target.value)} className="w-full bg-white border p-2 rounded text-sm text-center" />
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Preço (R$)</label>
                  <input type="text" placeholder="0,00" value={batch.price} onChange={e => updateBatch(index, 'price', e.target.value)} className="w-full bg-white border p-2 rounded text-sm text-center font-bold text-green-600" />
                </div>
              </div>
            ))}

            <button type="button" onClick={addBatch} className="text-sm font-bold text-blue-600 hover:underline mt-2 flex items-center gap-1">
              + Adicionar mais um lote
            </button>
          </div>

          {/* BOTÃO FINAL */}
          <div className="flex gap-4 pt-4">
             <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-300 font-bold py-4 rounded-lg uppercase">Cancelar</button>
             <button disabled={loading} type="submit" className="flex-[2] bg-green-500 text-white font-black py-4 rounded-lg uppercase shadow-lg hover:bg-green-600 transition-colors">
               {loading ? 'Salvando...' : 'Publicar Evento'}
             </button>
          </div>

        </form>
      </div>
    </div>
  )
}