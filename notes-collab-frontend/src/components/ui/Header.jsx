import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

export default function Header() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/notes" className="logo">
          Notes Collaboratives
        </Link>
        {user && (
          <div className="user-actions">
            <span className="username">Bonjour, {user.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  )
}