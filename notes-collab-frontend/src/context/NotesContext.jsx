import { createContext, useState, useEffect, useContext } from 'react'
import { useSocket } from '../services/socket'
import api from '../services/api'
import { AuthContext } from './AuthContext'

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

  // ... fonctions CRUD et gestion WebSocket similaires à l'exemple précédent ...
  
  return (
    <NotesContext.Provider value={{
      notes, currentNote, loading, error,
      fetchNotes, fetchNote, saveNote, deleteNote,
      updateNoteContent, activeUsers, cursorPositions
    }}>
      {children}
    </NotesContext.Provider>
  )
}