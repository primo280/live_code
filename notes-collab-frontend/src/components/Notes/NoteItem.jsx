import { Link } from 'react-router-dom'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useContext } from 'react'
import { NotesContext } from './NotesContext'

export default function NoteItem({ note }) {
  const { deleteNote } = useContext(NotesContext)

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Supprimer cette note ?')) {
      deleteNote(note._id)
    }
  }

  return (
    <Link
      to={`/notes/${note._id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-lg mb-2">{note.title}</h3>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Supprimer la note"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
      <p className="text-gray-600 line-clamp-3 mb-3">{note.content}</p>
      <div className="flex flex-wrap gap-2">
        {note.tags.map(tag => (
          <span
            key={tag}
            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  )
}