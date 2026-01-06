'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StaffLogin() {
  const router = useRouter()
  
  // Estados
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState('')

  // Lista de Usuários
  const USERS = [
    { u: 'rui', p: '192508' },
    { u: 'johnny', p: 'J0hnny@1' },
    { u: 'caixa', p: 'Caverna69@' }
  ]

  useEffect(() => {
    const savedAuth = localStorage.getItem('staff_auth')
    const savedUser = localStorage.getItem('staff_user')
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
      if (savedUser) setCurrentUser(savedUser)
    }
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    const valid = USERS.find(user => 
      user.u === username.toLowerCase().trim() && 
      user.p === password.trim()
    )
    
    if (valid) {
      localStorage.setItem('staff_auth', 'true')
      localStorage.setItem('staff_user', valid.u)
      setIsAuthenticated(true)
      setCurrentUser(valid.u)
    } else {
      alert('Acesso Negado. Verifique usuário e senha.')
    }
  }

  function handleLogout() {
    if (confirm('Sair do sistema?')) {
      localStorage.removeItem('staff_auth')
      localStorage.removeItem('staff_user')
      setIsAuthenticated(false)
      setUsername('')
      setPassword('')
    }
  }

  // --- TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-gray-900 p-8 rounded-2xl border border-gray-800">
            <h1 className="text-2xl font-black text-yellow-500 uppercase text-center mb-6">Staff Access</h1>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Usuário</label>
                <input 
                  autoFocus
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" 
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Senha</label>
                <input 
                  type="password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" 
                />
              </div>

              <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase py-4 rounded-lg mt-4">
                ENTRAR
              </button>
            </form>
            
            <Link href="/" className="block text-center text-gray-500 text-xs mt-6">← Voltar ao site</Link>
        </div>
      </div>
    )
  }

  // --- MENU LOGADO ---
  return (
    <div className="min-h-screen bg-yellow-500 p-6 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-md flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black uppercase text-black">Olá, {currentUser || 'Staff'}</h1>
            <button onClick={handleLogout} className="text-black text-xs font-bold underline">SAIR</button>
        </div>

        <div className="w-full max-w-md space-y-4">
          
          <Link href="/checkin">
            <div className="bg-black text-white p-6 rounded-xl flex items-center gap-4 shadow-xl hover:scale-[1.02] transition-transform cursor-pointer">
                <span className="text-3xl">📷</span>
                <div>
                    <h2 className="font-bold text-lg uppercase">Portaria</h2>
                    <p className="text-xs text-gray-400">QR Code e Lista</p>
                </div>
            </div>
          </Link>

          <Link href="/staff/novo-evento">
            <div className="bg-white text-black p-6 rounded-xl flex items-center gap-4 shadow-xl hover:scale-[1.02] transition-transform border-4 border-black">
                <span className="text-3xl">📅</span>
                <div>
                    <h2 className="font-bold text-lg uppercase">Gestão de Eventos</h2>
                    <p className="text-xs text-gray-600">Criar e Apagar Festas</p>
                </div>
            </div>
          </Link>

        </div>
    </div>
  )
}