import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    },
    card: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      width: '24rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.25rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
    },
    button: {
      width: '100%',
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer'
    },
    buttonHover: {
      backgroundColor: '#1d4ed8'
    },
    buttonFocus: {
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      login(username)
      navigate('/notes')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Notes Collaboratives</h1>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              onFocus={(e) => e.target.style = {...styles.input, ...styles.inputFocus}}
              onBlur={(e) => e.target.style = styles.input}
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>
          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => e.target.style = {...styles.button, ...styles.buttonHover}}
            onMouseOut={(e) => e.target.style = styles.button}
            onFocus={(e) => e.target.style = {...styles.button, ...styles.buttonFocus, ...styles.buttonHover}}
            onBlur={(e) => e.target.style = styles.button}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}