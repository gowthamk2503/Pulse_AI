import axios from 'axios';

let rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');
if (rawBaseUrl.startsWith('http') && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}
const API_BASE_URL = rawBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
});

// Request interceptor to attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pulseai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors cleanly & auto-retry on backend cold starts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Auto-retry once on cold-start network glitch / wake-up
    if (config && !config._retry && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))) {
      config._retry = true;
      console.warn('Network glitch detected (backend may be spinning up from cold sleep). Retrying request in 2.5s...');
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return apiClient(config);
    }

    if (error.response?.status === 401) {
      // Clear token if invalid on protected pages
      if (window.location.pathname.startsWith('/dashboard') || 
          window.location.pathname.startsWith('/analyze') || 
          window.location.pathname.startsWith('/batch-analysis') || 
          window.location.pathname.startsWith('/analytics') || 
          window.location.pathname.startsWith('/history') || 
          window.location.pathname.startsWith('/settings')) {
        localStorage.removeItem('pulseai_token');
        localStorage.removeItem('pulseai_user');
      }
    }
    return Promise.reject(error);
  }
);

// API Service calls
export const api = {
  // System & Model
  health: () => apiClient.get('/health'),
  getModelInfo: () => apiClient.get('/model/info'),

  // Auth
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),

  // Analysis
  analyzeText: (text, saveToHistory = true) =>
    apiClient.post('/analyze', { text, save_to_history: saveToHistory }),

  // Batch
  previewCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/analyze/preview-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  analyzeBatch: (file, textColumn, saveToHistory = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text_column', textColumn);
    formData.append('save_to_history', saveToHistory);
    return apiClient.post('/analyze/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Analytics & History
  getAnalyticsSummary: () => apiClient.get('/analytics/summary'),
  
  getHistory: (params = {}) => apiClient.get('/history', { params }),
  deleteHistoryItem: (id) => apiClient.delete(`/history/${id}`),
  clearHistory: () => apiClient.delete('/history'),
};

export default apiClient;
