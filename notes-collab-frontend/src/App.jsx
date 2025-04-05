import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotesProvider } from './context/NotesContext'
import AppRoutes from './routes'

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotesProvider>
          <AppRoutes />
        </NotesProvider>
      </AuthProvider>
    </Router>
  )
}

export default App