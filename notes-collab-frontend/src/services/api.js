import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('notes-user'))
  if (user) {
    config.headers['Authorization'] = `Bearer ${user.id}`
  }
  return config
})

export default api