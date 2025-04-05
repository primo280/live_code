import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotesProvider } from './components/Notes/NotesContext'
import Login from './components/Auth/Login'
import NoteList from './components/Notes/NoteList'
import NoteEditor from './components/Notes/NoteEditor'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/notes" replace />} />
              <Route path="notes" element={<NoteList />} />
              <Route path="notes/:id" element={<NoteEditor />} />
              <Route path="notes/new" element={<NoteEditor />} />
            </Route>
          </Routes>
        </Router>
      </NotesProvider>
    </AuthProvider>
  )
}

export default App