import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotesContext } from '../../context/NotesContext'
import NoteItem from './NoteItem'
import TagFilter from '../ui/TagFilter'

export default function NoteList() {
  const { notes, loading, error } = useContext(NotesContext)
  const [filteredTag, setFilteredTag] = useState('')
  const navigate = useNavigate()

  const filteredNotes = filteredTag
    ? notes.filter(note => note.tags.includes(filteredTag))
    : notes

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2>Mes Notes</h2>
        <button onClick={() => navigate('/notes/new')}>+ Nouvelle note</button>
      </div>
      
      <TagFilter notes={notes} onFilter={setFilteredTag} />
      
      {loading && <p>Chargement...</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="notes-grid">
        {filteredNotes.map(note => (
          <NoteItem key={note._id} note={note} />
        ))}
      </div>
    </div>
  )
}