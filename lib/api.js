// lib/api.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: "https://edufeedback-app.vercel.app/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

// IMPORTANT: Interceptor to add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;