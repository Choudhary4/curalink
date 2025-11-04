import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Patients
export const patients = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getRecommendations: () => api.get('/patients/recommendations'),
};

// Researchers
export const researchers = {
  getProfile: () => api.get('/researchers/profile'),
  updateProfile: (data) => api.put('/researchers/profile', data),
  findExperts: (params) => api.get('/researchers/experts', { params }),
  findCollaborators: (params) => api.get('/researchers/collaborators', { params }),
};

// Clinical Trials
export const trials = {
  getAll: (params) => api.get('/trials', { params }),
  getById: (id) => api.get(`/trials/${id}`),
  create: (data) => api.post('/trials', data),
  update: (id, data) => api.put(`/trials/${id}`, data),
  searchGov: (params) => api.get('/trials/search-gov', { params }),
};

// Publications
export const publications = {
  getAll: (params) => api.get('/publications', { params }),
  getById: (id) => api.get(`/publications/${id}`),
  save: (data) => api.post('/publications', data),
  searchPubmed: (params) => api.get('/publications/search-pubmed', { params }),
  searchOrcid: (params) => api.get('/publications/search-orcid', { params }),
  getByOrcid: (orcid) => api.get(`/publications/orcid/${orcid}`),
};

// Forums
export const forums = {
  getAll: () => api.get('/forums'),
  getById: (id) => api.get(`/forums/${id}`),
  create: (data) => api.post('/forums', data),
  getPosts: (forumId, params) => api.get(`/forums/${forumId}/posts`, { params }),
  getPost: (postId) => api.get(`/forums/posts/${postId}`),
  createPost: (forumId, data) => api.post(`/forums/${forumId}/posts`, data),
  createReply: (postId, data) => api.post(`/forums/posts/${postId}/replies`, data),
};

// Favorites
export const favorites = {
  getAll: (params) => api.get('/favorites', { params }),
  add: (data) => api.post('/favorites', data),
  remove: (itemType, itemId) => api.delete('/favorites', { data: { item_type: itemType, item_id: itemId } }),
  check: (itemType, itemId) => api.get(`/favorites/check`, { params: { item_type: itemType, item_id: itemId } }),
};

// Meetings
export const meetings = {
  request: (data) => api.post('/meetings/request', data),
  getRequests: (params) => api.get('/meetings', { params }),
  updateStatus: (id, status, additionalData = {}) => api.put(`/meetings/${id}/status`, { status, ...additionalData }),
  requestCollaboration: (data) => api.post('/meetings/collaborations/request', data),
  getCollaborations: (params) => api.get('/meetings/collaborations', { params }),
  updateCollaborationStatus: (id, status) => api.put(`/meetings/collaborations/${id}/status`, { status }),
};

// Messages
export const messages = {
  send: (data) => api.post('/messages', data),
  getAll: (params) => api.get('/messages', { params }),
  getUnreadCount: () => api.get('/messages/unread-count'),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  delete: (id) => api.delete(`/messages/${id}`),
};

// Profile
export const profile = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadPicture: (formData) => {
    return api.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePicture: () => api.delete('/profile/picture'),
};

// AI Services
export const ai = {
  checkStatus: () => api.get('/ai/status'),
  summarize: (data) => api.post('/ai/summarize', data),
  simplifyAbstract: (data) => api.post('/ai/simplify/abstract', data),
  simplifyTrial: (data) => api.post('/ai/simplify/trial', data),
  extractKeywords: (data) => api.post('/ai/extract-keywords', data),
  generateQuery: (data) => api.post('/ai/generate-query', data),
  answerQuestion: (data) => api.post('/ai/answer-question', data),
  generateForumResponse: (data) => api.post('/ai/generate-forum-response', data),
};

export default api;
