import { useContext } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Header from './Header'
import { AuthContext } from '../../context/AuthContext'

export default function Layout() {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}