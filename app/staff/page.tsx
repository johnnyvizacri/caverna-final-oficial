'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StaffLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const USERS = [
    { u: 'rui', p: '192508' },
    { u: 'johnny', p: 'J0hnny@1' }, // Note que mudei pra minúsculo pra facilitar, digite tudo minúsculo no login
    { u: 'caixa', p: 'Caverna69@' }
  ]

  useEffect(() => {
    if (localStorage.getItem('staff_auth')) setIsAuthenticated(true)
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const valid = USERS.find(user => user.u === username.toLowerCase() && user.p === password)
    
    if (valid) {
      localStorage.setItem('staff_auth', 'true')
      setIsAuthenticated(true)
    } else {
      alert('Acesso Negado')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-sm">
            <h1 className="text-xl font-bold text-yellow-500 mb-6 uppercase text-center">Acesso Staff</h1>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuário" className="w-full bg-black border border-gray-700 rounded p-3 mb-3 text-white" />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Senha" className="w-full bg-black border border-gray-700 rounded p-3 mb-6 text-white" />
            <button className="w-full bg-yellow-500 text-black font-bold py-3 rounded uppercase">Entrar</button>
            <Link href="/" className="block text-center text-gray-500 text-xs mt-4">Voltar</Link>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-500 p-6 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-black uppercase">Painel da Equipe</h1>
        <Link href="/checkin" className="bg-black text-white p-6 rounded-xl w-full max-w-sm text-center font-bold text-xl uppercase shadow-xl">📷 Abrir Portaria</Link>
        <button onClick={() => { localStorage.removeItem('staff_auth'); setIsAuthenticated(false) }} className="text-black underline text-sm font-bold">Sair</button>
    </div>
  )
}