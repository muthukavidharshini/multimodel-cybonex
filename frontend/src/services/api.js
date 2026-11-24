import axios from 'axios'
import toast from 'react-hot-toast'

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const baseURL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api'

export const IS_ENV_DEMO_MODE =
  String(import.meta.env.VITE_DEMO_MODE || '').trim().toLowerCase() === 'true'

const api = axios.create({
  baseURL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token (skipped for pure client-side offline demo tokens)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && !token.startsWith('offline-demo-')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response error handling — avoid infinite login redirect loops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = error.config?.url || ''
    const isHealthCheck = reqUrl.includes('/health')

    if (!isHealthCheck && (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED')) {
      if (!IS_ENV_DEMO_MODE) {
        toast.error(
          'Backend server is unreachable. Enable Demo Mode or verify VITE_API_URL.',
          { id: 'network-error', duration: 5000 }
        )
      }
    } else if (error.response?.status === 401) {
      const storedUser = localStorage.getItem('user')
      let isDemoUser = false
      try {
        isDemoUser = Boolean(storedUser && JSON.parse(storedUser)?.is_demo)
      } catch {
        isDemoUser = false
      }

      // Only clear real auth sessions and dispatch event instead of hard-reloading in a loop
      if (!isDemoUser && !reqUrl.includes('/auth/')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.dispatchEvent(new CustomEvent('cybernex:unauthorized'))
      }
    } else if (error.response?.status === 503) {
      const msg =
        error.response?.data?.message ||
        'Database connection unavailable. Enable DEMO_MODE=true on backend or verify MONGO_URI.'
      toast.error(msg, { id: 'db-error', duration: 5000 })
    }
    return Promise.reject(error)
  }
)

export const healthAPI = {
  check: () => api.get('/health', { timeout: 8000 }),
}

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  demoLogin: (data = {}) => api.post('/auth/demo-login', data),
  profile: () => api.get('/auth/profile'),
}

export const detectAPI = {
  fakeNews: (data) => api.post('/detect/fake-news', data),
  phishing: (data) => api.post('/detect/phishing', data),
  digitalFraud: (data) => api.post('/detect/digital-fraud', data),
  crossModal: (data) => api.post('/detect/cross-modal', data),
  image: (formData) =>
    api.post('/detect/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
}

export const historyAPI = {
  getAll: (params) => api.get('/history', { params }),
  getOne: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
}

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
}

export const reportAPI = {
  getPdf: (id) =>
    api.get(`/reports/${id}/pdf`, {
      responseType: 'blob',
      timeout: 30000,
    }),
}

export default api
