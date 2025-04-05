import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotesContext } from '../../context/NotesContext'
import { AuthContext } from '../../context/AuthContext'
import NoteItem from './NoteItem'
import TagFilter from '../ui/TagFilter'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'

export default function NoteList() {
  const { notes, loading, error, fetchNotes } = useContext(NotesContext)
  const { user } = useContext(AuthContext)
  const [filteredTag, setFilteredTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user, fetchNotes])

  const filteredNotes = notes.filter(note => {
    const matchesTag = filteredTag ? note.tags.includes(filteredTag) : true
    const matchesSearch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesTag && matchesSearch
  })

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="notes-list-container">
      <div className="notes-list-header">
        <h1>Mes Notes</h1>
        <button 
          onClick={() => navigate('/notes/new')}
          className="new-note-button"
        >
          + Nouvelle Note
        </button>
      </div>

      <div className="notes-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher des notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <TagFilter 
          notes={notes} 
          onFilter={setFilteredTag} 
          selectedTag={filteredTag}
        />
      </div>

      {sortedNotes.length === 0 ? (
        <EmptyState 
          title={filteredTag || searchQuery ? "Aucun résultat" : "Aucune note"}
          message={
            filteredTag 
              ? `Aucune note avec le tag "${filteredTag}"`
              : searchQuery
              ? `Aucune note correspondant à "${searchQuery}"`
              : "Commencez par créer votre première note"
          }
          action={
            !filteredTag && !searchQuery
              ? () => navigate('/notes/new')
              : null
          }
        />
      ) : (
        <div className="notes-grid">
          {sortedNotes.map(note => (
            <NoteItem key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}