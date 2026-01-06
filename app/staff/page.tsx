'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StaffLogin() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // SENHA MESTRA (Simples e eficiente)
  const MASTER_KEY = "caverna2026" 

  useEffect(() => {
    // Se já digitou a senha antes, lembra dele
    const auth = localStorage.getItem('staff_auth')
    if (auth === 'true') setIsAuthenticated(true)
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === MASTER_KEY) {
      localStorage.setItem('staff_auth', 'true')
      setIsAuthenticated(true)
    } else {
      alert('Senha incorreta!')
    }
  }

  function handleLogout() {
    localStorage.removeItem('staff_auth')
    setIsAuthenticated(false)
  }

  // --- TELA DE LOGIN (Se não estiver logado) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-gray-900 p-8 rounded-2xl border border-gray-800 text-center">
          <h1 className="text-2xl font-black text-yellow-500 uppercase mb-2">Área Restrita</h1>
          <p className="text-gray-500 text-sm mb-6">Acesso exclusivo Staff Caverna</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Digite a Senha Mestra" 
              className="w-full bg-black border border-gray-700 rounded p-4 text-center text-xl tracking-widest outline-none focus:border-yellow-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="w-full bg-white text-black font-black uppercase py-4 rounded hover:bg-gray-200">
              Entrar
            </button>
          </form>
          <Link href="/" className="block mt-6 text-gray-600 text-xs hover:text-white">Voltar para o site</Link>
        </div>
      </div>
    )
  }

  // --- PAINEL PRINCIPAL (Se acertou a senha) ---
  return (
    <div className="min-h-screen bg-yellow-500 text-black p-6 flex flex-col items-center">
      
      <div className="w-full max-w-md flex justify-between items-center mb-10">
        <h2 className="font-black uppercase text-xl">Painel Staff</h2>
        <button onClick={handleLogout} className="text-xs font-bold underline">Sair</button>
      </div>

      <div className="w-full max-w-md space-y-4">
        
        {/* BOTÃO 1: PORTARIA */}
        <Link href="/checkin">
          <div className="bg-black text-white p-6 rounded-2xl flex items-center gap-4 shadow-xl hover:scale-105 transition-transform cursor-pointer group">
            <div className="bg-gray-800 p-4 rounded-full text-2xl group-hover:bg-green-500 group-hover:text-black transition-colors">📷</div>
            <div>
              <h3 className="font-black text-xl uppercase">Portaria / Check-in</h3>
              <p className="text-gray-400 text-xs">Ler QR Code e liberar entrada</p>
            </div>
          </div>
        </Link>

        {/* BOTÃO 2: CRIAR EVENTO */}
        <Link href="/staff/novo-evento">
          <div className="bg-white text-black p-6 rounded-2xl flex items-center gap-4 shadow-xl hover:scale-105 transition-transform cursor-pointer border-4 border-black">
            <div className="bg-yellow-100 p-4 rounded-full text-2xl">📅</div>
            <div>
              <h3 className="font-black text-xl uppercase">Novo Evento</h3>
              <p className="text-gray-600 text-xs">Cadastrar festa e lotes</p>
            </div>
          </div>
        </Link>

      </div>
      
      <p className="mt-auto pt-10 text-xs font-bold opacity-50">Sistema Caverna v2.0</p>
    </div>
  )
}