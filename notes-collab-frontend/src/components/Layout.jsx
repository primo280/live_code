import { useContext } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Navbar from './Navbar'

export default function Layout() {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}