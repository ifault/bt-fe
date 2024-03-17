import axios from 'axios';
import { API_URL } from '@/lib/constant';
const api = axios.create({
  baseURL: `http://${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;