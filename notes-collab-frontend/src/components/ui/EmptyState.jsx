import { useNavigate } from 'react-router-dom'

export default function EmptyState({ title, message, action }) {
  const navigate = useNavigate()

  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {action && (
        <button 
          onClick={() => navigate('/notes/new')}
          className="primary-button"
        >
          Créer une note
        </button>
      )}
    </div>
  )
}