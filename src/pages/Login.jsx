import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { login } from '../api/client.js'
import { Power, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login: doLogin } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    try {
      const data = await login(username, password)
      doLogin(data.token, data.user)
      toast.success('Bienvenido!')
      navigate('/')
    } catch (err) {
      toast.error('Usuario o contrasena incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
              <Power className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SitioPC</h1>
            <p className="text-sm text-slate-500 mt-1">Wake On LAN Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contrasena</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando...' : 'Iniciar sesion'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
