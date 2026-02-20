import axios from 'axios'
import type { ApiError } from '../types/api.types'

// Single shared Axios instance — NEVER create ad-hoc instances elsewhere
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — inject JWT Authorization header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — map ProblemDetail (RFC 7807) to typed ApiError
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    const apiError: ApiError = error.response?.data ?? {
      type: 'unknown',
      title: 'Network Error',
      status: 0,
      detail: 'Unable to connect to the server',
    }
    return Promise.reject(apiError)
  }
)

export default api
