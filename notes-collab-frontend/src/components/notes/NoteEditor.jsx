import { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NotesContext } from '../../context/NotesContext'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function NoteEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentNote,
    loading,
    error,
    saveNote,
    updateNoteContent,
    activeUsers
  } = useContext(NotesContext)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState([])
  const editorRef = useRef(null)

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title)
      setContent(currentNote.content)
      setTags(currentNote.tags)
    } else if (id !== 'new') {
      setTitle('')
      setContent('')
      setTags([])
    }
  }, [currentNote, id])

  const handleSave = async () => {
    const noteData = { title, content, tags }
    await saveNote(id === 'new' ? noteData : { ...noteData, _id: id })
    navigate('/notes')
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button onClick={handleSave}>Enregistrer</button>
      </div>
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="title-input"
      />
      
      <textarea
        ref={editorRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          if (id !== 'new') {
            updateNoteContent(id, e.target.value)
          }
        }}
        placeholder="Commencez à écrire..."
        className="content-textarea"
      />
      
      <div className="tags-section">
        {tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      
      <div className="active-users">
        {activeUsers.map(user => (
          <div key={user.id} className="user-badge">
            {user.username}
          </div>
        ))}
      </div>
    </div>
  )
}