import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification si disponible
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('notes-collab-user'))
  if (user) {
    config.headers['Authorization'] = `Bearer ${user.id}`
  }
  return config
})

export default api