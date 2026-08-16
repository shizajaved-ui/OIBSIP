import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000, // 15 seconds timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const resolveImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  // Use a relative path so the Vite proxy (set in vite.config.js) can handle it
  return image.startsWith('/') ? image : `/${image}`;
};

export default api;
