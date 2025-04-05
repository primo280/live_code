import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/notes" className="text-xl font-semibold text-blue-600">
          Notes Collaboratives
        </Link>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="text-gray-700">Bonjour, {user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}