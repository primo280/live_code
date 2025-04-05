import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import NoteList from './components/notes/NoteList'
import NoteEditor from './components/notes/NoteEditor'
import Layout from './components/ui/Layout'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/notes" replace />} />
        <Route path="notes" element={<NoteList />} />
        <Route path="notes/:id" element={<NoteEditor />} />
        <Route path="notes/new" element={<NoteEditor />} />
      </Route>
    </Routes>
  )
}