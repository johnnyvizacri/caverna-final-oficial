'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function StaffLogin() {
  const router = useRouter()
  
  // Estados de Login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState('')

  // Lista de Usuários Permitidos
  const USERS = [
    { u: 'rui', p: '192508' },
    { u: 'johnny', p: 'J0hnny@1' },
    { u: 'caixa', p: 'Caverna69@' }
  ]

  useEffect(() => {
    // Verifica se já existe uma sessão salva
    const savedAuth = localStorage.getItem('staff_auth')
    const savedUser = localStorage.getItem('staff_user')
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
      if (savedUser) setCurrentUser(savedUser)
    }
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    // Validação (remove espaços e ignora maiúsculas no nome)
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
      alert('❌ Acesso Negado: Usuário ou senha incorretos.')
    }
  }

  function handleLogout() {
    if (confirm('Deseja realmente sair do sistema?')) {
      localStorage.removeItem('staff_auth')
      localStorage.removeItem('staff_user')
      setIsAuthenticated(false)
      setUsername('')
      setPassword('')
    }
  }

  // --- TELA DE LOGIN (QUANDO NÃO ESTÁ LOGADO) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-[0_0_50px_rgba(255,255,0,0.1)]">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-yellow-500 uppercase tracking-tighter mb-2">STAFF ACCESS</h1>
              <p className="text-gray-500 text-xs uppercase tracking-widest">Área restrita da equipe</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Usuário</label>
                <input 
                  autoFocus
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="Ex: Johnny"
                  className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white focus:border-yellow-500 outline-none transition-colors" 
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Senha</label>
                <input 
                  type="password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••"
                  className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white focus:border-yellow-500 outline-none transition-colors" 
                />
              </div>

              <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase py