import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../lib/db.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auth.getSession().then(u => { setUser(u); setLoading(false) })
  }, [])

  const login = async (identifier, password) => {
    const res = await auth.login(identifier, password)
    if (res.data) {
      setUser(res.data)
      sessionStorage.setItem('sisoma_session', JSON.stringify(res.data))
    }
    return res
  }

  const logout = async () => {
    await auth.logout()
    setUser(null)
  }

  const register = async (form) => auth.register(form)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
