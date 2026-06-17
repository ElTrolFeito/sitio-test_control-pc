import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? saved : null
  })
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('role')
    return saved ? saved : null
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', user)
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  useEffect(() => {
    if (role) {
      localStorage.setItem('role', role)
    } else {
      localStorage.removeItem('role')
    }
  }, [role])

  const login = (newToken, newUser, newRole) => {
    setToken(newToken)
    setUser(newUser)
    setRole(newRole || 'USER')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setRole(null)
  }

  const isAdmin = role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ token, user, role, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
