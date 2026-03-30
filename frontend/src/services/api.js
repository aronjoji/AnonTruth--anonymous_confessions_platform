import axios from 'axios';

// In production, the backend serves the frontend, so API calls go to the same origin
// In development, Vite proxy forwards /api to localhost:5000
const isProd = import.meta.env.PROD;

export const SOCKET_URL = isProd ? '' : 'http://127.0.0.1:5000';

const API = axios.create({
  baseURL: isProd ? '/api' : '/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers['x-auth-token'] = token;
  }
  return req;
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const getUserStats = () => API.get('/auth/stats');

export const getConfessions = (params) => API.get('/confessions', { params });
export const getMyConfessions = () => API.get('/confessions/my');
export const getConfessionById = (id) => API.get(`/confessions/${id}`);
export const createConfession = (formData) => API.post('/confessions', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const voteConfession = (id, voteType) => API.post(`/confessions/${id}/vote`, { voteType });
export const reactToConfession = (id, reactionType) => API.post(`/confessions/${id}/react`, { reactionType });
export const shareConfession = (id) => API.post(`/confessions/${id}/share`);
export const deleteConfession = (id) => API.delete(`/confessions/${id}`);
export const searchConfessions = (params) => API.get('/confessions/search/query', { params });

export const getComments = (confessionId) => API.get(`/comments/${confessionId}`);
export const createComment = (formData) => API.post('/comments', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const reactToComment = (id, reactionType) => API.post(`/comments/${id}/react`, { reactionType });
export const reportContent = (data) => API.post('/reports', data);
export const submitContactForm = (data) => API.post('/contact', data);

// Notifications
export const getNotifications = (params) => API.get('/notifications', { params });
export const markAllNotificationsRead = () => API.put('/notifications/read');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);

// Anonymous Chats
export const startAnonChat = (confessionId) => API.post('/chats/start', { confessionId });
export const getMyChats = () => API.get('/chats/my');
export const getChat = (id) => API.get(`/chats/${id}`);
export const sendChatMessage = (id, text) => API.post(`/chats/${id}/message`, { text });
export const endChat = (id) => API.put(`/chats/${id}/end`);

export default API;
