import { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NotesContext } from './NotesContext'
import { AuthContext } from '../../context/AuthContext'
import { FiSave, FiArrowLeft } from 'react-icons/fi'

export default function NoteEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const {
    currentNote,
    loading,
    error,
    saveNote,
    updateNoteContent,
    activeUsers,
    cursorPositions
  } = useContext(NotesContext)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const editorRef = useRef(null)

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title)
      setContent(currentNote.content)
      setTags(currentNote.tags)
    }
  }, [currentNote])

  const handleSave = () => {
    const noteData = { title, content, tags }
    if (id === 'new') {
      saveNote(noteData)
    } else {
      saveNote({ ...noteData, _id: id })
    }
    navigate('/notes')
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    updateNoteContent(id, newContent)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-1" /> Retour
        </button>
        <button
          onClick={handleSave}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <FiSave className="mr-1" /> Enregistrer
        </button>
      </div>

      {loading && <div className="text-center py-8">Chargement...</div>}
      {error && <div className="text-center py-8 text-red-500">Erreur: {error}</div>}

      {!loading && !error && (
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Titre de la note"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Contenu
            </label>
            <textarea
              ref={editorRef}
              id="content"
              value={content}
              onChange={handleContentChange}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="Contenu de la note..."
            />
            {/* Afficher les curseurs des autres utilisateurs */}
            <div className="relative">
              {Object.entries(cursorPositions).map(([userId, position]) => {
                if (userId !== user.id) {
                  const userData = activeUsers.find(u => u.id === userId)
                  return (
                    <div
                      key={userId}
                      className="absolute h-6 w-0.5 bg-red-500"
                      style={{ left: `${position}px`, top: '0' }}
                    >
                      <div className="text-xs bg-red-500 text-white px-1 rounded">
                        {userData?.username}
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajouter un tag"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Ajouter
              </button>
            </form>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Utilisateurs actifs</h3>
            <div className="flex flex-wrap gap-2">
              {activeUsers.map(user => (
                <span
                  key={user.id}
                  className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {user.username}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}