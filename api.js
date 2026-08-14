import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // A hung request (e.g. the backend waiting on a blocked SMTP connection)
  // would otherwise leave callers awaiting forever — any button tied to
  // `finally { setLoading(false) }` would spin indefinitely with no error.
  // This guarantees every request settles one way or another.
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Inventory images are either a full Cloudinary URL (starts with http, used
// when Cloudinary is configured on the backend) or a relative local path
// like "/uploads/xyz.jpg" (fallback when it isn't). This resolves either
// case to something an <img> tag can actually load.
export const resolveImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  // Use a relative path so the Vite proxy (set in vite.config.js) can handle it
  return image.startsWith('/') ? image : `/${image}`;
};

export default api;
