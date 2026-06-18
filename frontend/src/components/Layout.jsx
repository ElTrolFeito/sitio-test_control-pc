import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useNavigate } from 'react-router-dom'
import { Power, LogOut, Palette } from 'lucide-react'
import ThemeSettings from './ThemeSettings.jsx'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { theme, customThemeEnabled, primaryColor, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showThemeSettings, setShowThemeSettings] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Power className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">SitioPC</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">{user}</span>
              <button
                onClick={() => setShowThemeSettings(true)}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${customThemeEnabled
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                title="Personalizar tema"
              >
                {customThemeEnabled ? (
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  />
                ) : (
                  <Palette className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

      {showThemeSettings && (
        <ThemeSettings onClose={() => setShowThemeSettings(false)} />
      )}
    </div>
  )
}
