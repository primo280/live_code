import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('notes-user')
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  const login = (username) => {
    const userData = { username, id: Date.now().toString() }
    setUser(userData)
    localStorage.setItem('notes-user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('notes-user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}