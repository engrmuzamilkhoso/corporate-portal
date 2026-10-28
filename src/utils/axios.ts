import axios from 'axios'
import nonceService from './NonceGenerateService'
import { EncryptionDecryptionService } from './encryptionDecryptionService'

const ENCRYPTED_ROUTES = [
  'auth/v3/login',
  '/auth/v2/changePassword',
  '/auth/forgotPassword'
]

let latestNonce: string | null = null
const NONCE = 'nonce'
const encryptionDecryptionService = new EncryptionDecryptionService()

export const api = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
    'Expect-CT': 'max-age=86400, enforce',
    'X-Frame-Options': 'DENY', // Prevent clickjacking
    'X-XSS-Protection': '1; mode=block', // Enable XSS filter
    'X-Content-Type-Options': 'nosniff', // Prevent MIME sniffing
    'Feature-Policy': "geolocation 'self'; vibrate 'none'",
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
  },
})

// Interceptor for requests
api.interceptors.request.use(
  async (config) => {
    const authData = localStorage.getItem('authToken')

    if (authData) {
      try {
        const parsedData = JSON.parse(authData)
        const token = parsedData.token // Access the token key

        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Failed to parse auth token:', error)
      }
    }

    try {
      const { signature, nonce, timestamp, userId } = await nonceService.generateSignature()

      config.headers['X-Nonce'] = nonce
      config.headers['X-Timestamp'] = timestamp
      config.headers['X-Signature'] = signature

      if (userId) {
        config.headers['X-User-ID'] = userId
      }
    } catch (error) {
      console.error('Error generating nonce signature:', error)
      return config // proceed without headers if something fails
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor for responses
api.interceptors.response.use(
  async (response) => {
    const url = response.config.url!

    if (ENCRYPTED_ROUTES.includes(url)) {
      const decryptedResponseBody = await encryptionDecryptionService.decryptResponseBody(
        response.data,
      )
      response.data = decryptedResponseBody
      console.log('logging decrypted response', decryptedResponseBody)
    }

    return response
  },
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('authToken')
      const fullPath = window.location.pathname + window.location.search
      const basePath = '/corporate-portal/frontend'
      const lastPath = fullPath.replace(basePath, '')
      localStorage.setItem('last_page', lastPath !== '/login' ? lastPath : '/dashboard/main')
      window.location.href = process.env.BASE_PATH! || ''
    }

    return Promise.reject(error)
  },
)

export default api
