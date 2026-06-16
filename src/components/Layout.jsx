import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { Power, LogOut } from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Power className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-slate-900">SitioPC</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden sm:inline">{user}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
