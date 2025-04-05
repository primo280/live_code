import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { useSocket } from '../../services/socket'
import api from '../../services/api'

export const NotesContext = createContext()

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeUsers, setActiveUsers] = useState([])
  const [cursorPositions, setCursorPositions] = useState({})
  
  const socket = useSocket()
  const { user } = useContext(AuthContext)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/notes')
      setNotes(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchNote = useCallback(async (id) => {
    if (id === 'new') {
      setCurrentNote({ title: '', content: '', tags: [] })
      return
    }
    
    setLoading(true)
    try {
      const response = await api.get(`/notes/${id}`)
      setCurrentNote(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveNote = useCallback(async (noteData) => {
    setLoading(true)
    try {
      let response
      if (noteData._id) {
        response = await api.put(`/notes/${noteData._id}`, noteData)
        setNotes(notes.map(n => n._id === noteData._id ? response.data : n))
      } else {
        response = await api.post('/notes', noteData)
        setNotes([...notes, response.data])
      }
      setError(null)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [notes])

  const deleteNote = useCallback(async (id) => {
    setLoading(true)
    try {
      await api.delete(`/notes/${id}`)
      setNotes(notes.filter(note => note._id !== id))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [notes])

  const updateNoteContent = useCallback((noteId, content) => {
    if (socket && noteId && noteId !== 'new') {
      socket.emit('update-note-content', { noteId, content })
      
      // Envoyer la position du curseur
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const cursorPosition = range.startOffset
        socket.emit('cursor-position', { noteId, position: cursorPosition })
      }
    }
  }, [socket])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    if (!socket || !user) return

    // Écouter les mises à jour en temps réel
    socket.on('note-updated', (updatedNote) => {
      setNotes(prevNotes =>
        prevNotes.map(note => note._id === updatedNote._id ? updatedNote : note)
      )
      if (currentNote && currentNote._id === updatedNote._id) {
        setCurrentNote(updatedNote)
      }
    })

    socket.on('note-created', (newNote) => {
      setNotes(prevNotes => [...prevNotes, newNote])
    })

    socket.on('note-deleted', (deletedId) => {
      setNotes(prevNotes => prevNotes.filter(note => note._id !== deletedId))
    })

    socket.on('active-users', (users) => {
      setActiveUsers(users.filter(u => u.id !== user.id))
    })

    socket.on('user-cursor-position', ({ userId, position }) => {
      setCursorPositions(prev => ({ ...prev, [userId]: position }))
    })

    return () => {
      socket.off('note-updated')
      socket.off('note-created')
      socket.off('note-deleted')
      socket.off('active-users')
      socket.off('user-cursor-position')
    }
  }, [socket, user, currentNote])

  return (
    <NotesContext.Provider
      value={{
        notes,
        currentNote,
        loading,
        error,
        fetchNotes,
        fetchNote,
        saveNote,
        deleteNote,
        updateNoteContent,
        activeUsers,
        cursorPositions
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}