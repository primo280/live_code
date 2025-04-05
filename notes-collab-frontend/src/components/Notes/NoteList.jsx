import { useContext, useState } from 'react'
import { NotesContext } from './NotesContext'
import NoteItem from './NoteItem'
import TagFilter from '../Tags/TagFilter'

export default function NoteList() {
  const { notes, loading, error } = useContext(NotesContext)
  const [filteredTag, setFilteredTag] = useState('')

  const filteredNotes = filteredTag
    ? notes.filter(note => note.tags.includes(filteredTag))
    : notes

  if (loading) return <div className="text-center py-8">Chargement...</div>
  if (error) return <div className="text-center py-8 text-red-500">Erreur: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mes Notes</h2>
        <TagFilter notes={notes} onFilter={setFilteredTag} />
      </div>
      
      {filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filteredTag ? 'Aucune note avec ce tag' : 'Aucune note disponible'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <NoteItem key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}