import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (session persistée)
    const storedUser = localStorage.getItem('notes-collab-user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (username) => {
    const userData = { username, id: Date.now().toString() }
    setUser(userData)
    localStorage.setItem('notes-collab-user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('notes-collab-user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}