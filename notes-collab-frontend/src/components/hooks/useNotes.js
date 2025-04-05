import { useContext } from 'react'
import { NotesContext } from '../context/NotesContext'

export default function useNotes() {
  const context = useContext(NotesContext)
  
  if (!context) {
    throw new Error('useNotes doit être utilisé dans un NotesProvider')
  }

  return context
}