'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase' // Note que subimos 3 níveis (../../..)

export default function EditarEvento({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // Estados do formulário
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    loadEventData()
  }, [])

  async function loadEventData() {
    // 1. Busca o evento pelo ID
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      alert('Evento não encontrado!')
      router.push('/staff/eventos')
      return
    }

    // 2. Preenche os campos
    setTitle(data.title)
    setDescription(data.description || '')
    
    // Separa Data e Hora do formato ISO
    const dataObj = new Date(data.date)
    setDate(dataObj.toISOString().split('T')[0]) // Pega YYYY-MM-DD
    setTime(dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    
    setLoading(false)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const fullDate = new Date(`${date}T${time}:00`)

    const { error } = await supabase
      .from('events')
      .update({
        title,
        description,
        date: fullDate.toISOString()
      })
      .eq('id', params.id)

    if (error) {
      alert('Erro ao atualizar.')
    } else {
      alert('Evento atualizado com sucesso!')
      router.push('/staff/eventos')
    }
    setLoading(false)
  }

  if (loading) return <div className="p-10 text-center">Carregando dados...</div>

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-xl font-black uppercase mb-6 border-b pb-4">Editar Evento</h1>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome do Evento</label>
            <input 
              className="w-full bg-gray-50 border border-gray-300 p-3 rounded font-bold"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Data</label>
              <input 
                type="date"
                className="w-full bg-gray-50 border border-gray-300 p-3 rounded"
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Hora</label>
              <input 
                type="time"
                className="w-full bg-gray-50 border border-gray-300 p-3 rounded"
                value={time} 
                onChange={e => setTime(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descrição</label>
            <textarea 
              rows={4}
              className="w-full bg-gray-50 border border-gray-300 p-3 rounded"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          <div className="flex gap-4 pt-4 mt-4 border-t">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-3 rounded bg-gray-200 text-gray-600 font-bold uppercase hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-6 py-3 rounded bg-blue-600 text-white font-bold uppercase hover:bg-blue-700 shadow-lg"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}