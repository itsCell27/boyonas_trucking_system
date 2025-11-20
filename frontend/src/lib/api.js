import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost/react_trucking_system/backend/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
