'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function MinhaConta() {
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    // Busca ingressos batendo E-mail E CPF (Segurança dupla)
    const { data } = await supabase
      .from('tickets')
      .select('*, events(title, date)')
      .eq('customer_email', email)
      .eq('customer_cpf', cpf)
      .order('created_at', { ascending: false })

    if (data) setTickets(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      
      {/* Cabeçalho Simples */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-10">
        <Link href="/" className="text-yellow-500 font-black text-2xl uppercase tracking-tighter">
          A Caverna
        </Link>
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white">
          VOLTAR PARA HOME
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-black text-yellow-500 uppercase mb-2 text-center">Meus Ingressos</h1>
          <p className="text-gray-400 text-sm text-center mb-8">Digite seus dados para encontrar suas compras.</p>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Seu E-mail</label>
              <input 
                required 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 mt-1 focus:border-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Seu CPF</label>
              <input 
                required 
                type="text" 
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full bg-black border border-gray-700 rounded-lg p-3 mt-1 focus:border-yellow-500 outline-none"
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase py-4 rounded-lg mt-4"
            >
              {loading ? 'Buscando...' : 'Acessar Ingressos'}
            </button>
          </form>
        </div>

        {/* Lista de Ingressos Encontrados */}
        {searched && (
          <div className="mt-10 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-4">Ingressos encontrados: {tickets.length}</h3>
            
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white text-black p-4 rounded-xl flex justify-between items-center shadow-lg">
                <div>
                  <h4 className="font-black uppercase text-lg">{ticket.events?.title}</h4>
                  <p className="text-xs font-bold text-gray-500">
                    {new Date(ticket.events?.date).toLocaleDateString('pt-BR')} • {ticket.status === 'checked_in' ? 'JÁ UTILIZADO' : 'VÁLIDO'}
                  </p>
                </div>
                <Link href={`/ticket?id=${ticket.id}`}>
                  <button className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-800">
                    Ver QR Code
                  </button>
                </Link>
              </div>
            ))}

            {tickets.length === 0 && !loading && (
              <div className="text-center p-6 bg-gray-900 rounded-xl border border-dashed border-gray-700">
                <p className="text-gray-400">Nenhum ingresso encontrado para esses dados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}