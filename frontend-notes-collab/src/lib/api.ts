import axios from 'axios';

const api = axios.create({
  baseURL: 'https://notes-collab-backend.up.railway.app',
});

export default api;
