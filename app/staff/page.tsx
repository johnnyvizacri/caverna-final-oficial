'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StaffLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const router = useRouter()

  // LISTA DE USUÁRIOS PERMITIDOS
  const ALLOWED_USERS = [
    { user: 'Rui Poloni', pass: '192508' },
    { user: 'Johnny Vizacri', pass: 'J0hnny@1' },
    { user: 'Caixa', pass: 'Caverna69@' }
  ]

  useEffect(() => {
    const auth = localStorage.getItem('staff_auth')
    const savedUser = localStorage.getItem('staff_user')
    if (auth === 'true') {
      setIsAuthenticated(true)
      if (savedUser) setCurrentUser(savedUser)
    }
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    // Procura se existe algum usuário que bate o Nome E a Senha
    const validUser = ALLOWED_USERS.find(
      u => u.user.toLowerCase() === username.trim().toLowerCase() && u.pass === password.trim()
    )

    if (validUser) {
      localStorage.setItem('staff_auth', 'true')
      localStorage.setItem('staff_user', validUser.user)
      setIsAuthenticated(true)
      setCurrentUser(validUser.user)
    } else {
      alert('Usuário ou Senha incorretos!')
    }
  }

  function handleLogout() {
    localStorage.removeItem('staff_auth')
    localStorage.removeItem('staff_user')
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
  }

  // --- TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-gray-900 p-8 rounded-2xl border border-gray-800 text-center shadow-2xl">
          <h1 className="text-2xl font-black text-yellow-500 uppercase mb-2">Acesso Restrito</h1>
          <p className="text-gray-500 text-sm mb-6">Identifique-se para continuar</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-left">
              <label className="text-xs font-bold text-gray-500 ml-1">NOME DO USUÁRIO</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Rui Poloni" 
                className="w-full bg-black border border-gray-700 rounded p-3 mt-1 outline-none focus:border-yellow-500 transition-colors"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div className="text-left">
              <label className="text-xs font-bold text-gray-500 ml-1">SENHA</label>
              <input 
                required
                type="password" 
                placeholder="••••••" 
                className="w-full bg-black border border-gray-700 rounded p-3 mt-1 outline-none focus:border-yellow-500 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase py-4 rounded mt-4 transition-transform active:scale-95 shadow-lg">
              ACESSAR SISTEMA
            </button>
          </form>
          
          <Link href="/" className="block mt-8 text-gray-600 text-xs hover:text-white transition-colors">
            ← Voltar para o site público
          </Link>
        </div>
      </div>
    )
  }

  // --- PAINEL PRINCIPAL ---
  return (
    <div className="min-h-screen bg-yellow-500 text-black p-6 flex flex-col items-center">
      
      <div className="w-full max-w-md flex justify-between items-center mb-10 bg-black/10 p-4 rounded-xl backdrop-blur-sm">
        <div>
          <p className="text-xs font-bold opacity-60 uppercase">Bem-vindo,</p>
          <h2 className="font-black uppercase text-lg leading-none">{currentUser}</h2>
        </div>
        <button onClick={handleLogout} className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          SAIR
        </button>
      </div>

      <div className="w-full max-w-md space-y-4">
        
        {/* BOTÃO 1: PORTARIA */}
        <Link href="/checkin">
          <div className="bg-black text-white p-6 rounded-2xl flex items-center gap-4 shadow-xl hover:scale-105 transition-transform cursor-pointer group border-2 border-transparent hover:border-white">
            <div className="bg-gray-800 p-4 rounded-full text-2xl group-hover:bg-green-500 group-hover:text-black transition-colors">📷</div>
            <div>
              <h3 className="font-black text-xl uppercase">Portaria / Check-in</h3>
              <p className="text-gray-400 text-xs group-hover:text-gray-300">Ler QR Code e liberar entrada</p>
            </div>
          </div>
        </Link>

        {/* BOTÃO 2: CRIAR EVENTO */}
        <Link href="/staff/novo-evento">
          <div className="bg-white text-black p-6 rounded-2xl flex items-center gap-4 shadow-xl hover:scale-105 transition-transform cursor-pointer border-4 border-black group">
            <div className="bg-yellow-100 p-4 rounded-full text-2xl group-hover:scale-110 transition-transform">📅</div>
            <div>
              <h3 className="font-black text-xl uppercase">Gestão de Eventos</h3>
              <p className="text-gray-600 text-xs">Criar festas e gerenciar lotes</p>
            </div>
          </div>
        </Link>

      </div>
      
      <p className="mt-auto pt-10 text-xs font-bold opacity-50 uppercase tracking-widest">Sistema Caverna Staff</p>
    </div>
  )
}