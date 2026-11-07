/**
 * Base API client with graceful degradation
 * When the backend is unavailable, returns a structured UNAVAILABLE response
 * so the UI can show "Coming Soon" instead of raw errors.
 */

import { API_BASE_URL } from '../utils/constants'

const TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(message, type, status = null) {
    super(message)
    this.name = 'ApiError'
    this.type = type // 'NETWORK', 'TIMEOUT', 'SERVER', 'NOT_FOUND', 'UNAVAILABLE'
    this.status = status
  }
}

/**
 * Makes an API request with automatic error classification
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError('Resource not found', 'NOT_FOUND', 404)
      }
      if (response.status >= 500) {
        throw new ApiError('Server error', 'SERVER', response.status)
      }
      throw new ApiError(`Request failed: ${response.status}`, 'SERVER', response.status)
    }

    const data = await response.json()
    return { success: true, data }

  } catch (err) {
    clearTimeout(timeout)

    if (err instanceof ApiError) throw err

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out', 'TIMEOUT')
    }

    // Network error — backend is not connected
    throw new ApiError('Service unavailable', 'UNAVAILABLE')
  }
}

export async function get(endpoint) {
  return request(endpoint, { method: 'GET' })
}

export async function post(endpoint, body) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Safe wrapper: returns { data, error, unavailable } 
 * Use this in components to easily handle all states.
 */
export async function safeRequest(requestFn) {
  try {
    const result = await requestFn()
    return { data: result.data, error: null, unavailable: false }
  } catch (err) {
    if (err instanceof ApiError && (err.type === 'UNAVAILABLE' || err.type === 'NETWORK' || err.type === 'TIMEOUT')) {
      return { data: null, error: null, unavailable: true }
    }
    return { data: null, error: err.message || 'An unexpected error occurred', unavailable: false }
  }
}
