import { Link } from 'react-router-dom'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useNotes } from '../../hooks/useNotes'

export default function NoteItem({ note }) {
  const { deleteNote } = useNotes()

  const handleDelete = (e) => {
    e.preventDefault()
    if (window.confirm('Supprimer cette note ?')) {
      deleteNote(note._id)
    }
  }

  return (
    <Link to={`/notes/${note._id}`} className="note-card">
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <button onClick={handleDelete} className="delete-btn">
          <FiTrash2 />
        </button>
      </div>
      <p className="note-content">{note.content.substring(0, 150)}...</p>
      {note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  )
}