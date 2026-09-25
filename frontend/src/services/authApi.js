/**
 * Authentication and CSRF API Service
 * Communicates with the Django backend at /api/auth/
 */

const BASE_URL = import.meta?.env?.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : ''

const CSRF_ENDPOINT = `${BASE_URL}/api/auth/csrf/`
const SIGNUP_ENDPOINT = `${BASE_URL}/api/auth/signup/`
const LOGIN_ENDPOINT = `${BASE_URL}/api/auth/login/`
const LOGOUT_ENDPOINT = `${BASE_URL}/api/auth/logout/`
const ME_ENDPOINT = `${BASE_URL}/api/auth/me/`

let cachedCsrfToken = null

/**
 * Extracts the csrftoken cookie value from document.cookie if available.
 * @returns {string | null}
 */
export function getCsrfCookie() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Retrieves the current CSRF token from memory or cookies.
 * @returns {string | null}
 */
export function getCsrfToken() {
  return getCsrfCookie() || cachedCsrfToken
}

/**
 * Fetches a fresh CSRF cookie and token from Django /api/auth/csrf/.
 * @returns {Promise<string | null>}
 */
export async function fetchCsrfToken() {
  try {
    const response = await fetch(CSRF_ENDPOINT, {
      method: 'GET',
      credentials: 'same-origin',
    })
    if (response.ok) {
      const data = await response.json().catch(() => null)
      if (data && data.csrfToken) {
        cachedCsrfToken = data.csrfToken
        return data.csrfToken
      }
    }
  } catch {
    // Network or CORS error; fallback to document.cookie
  }
  return getCsrfCookie()
}

/**
 * Checks the current session authentication status via GET /api/auth/me/.
 * @returns {Promise<{ authenticated: boolean, username?: string, freePredictionsRemaining?: number }>}
 */
export async function checkAuthStatus() {
  try {
    const response = await fetch(ME_ENDPOINT, {
      method: 'GET',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      return { authenticated: false, freePredictionsRemaining: 10 }
    }

    const data = await response.json().catch(() => null)
    if (data && data.authenticated && typeof data.username === 'string') {
      return {
        authenticated: true,
        username: data.username,
      }
    }

    return {
      authenticated: false,
      freePredictionsRemaining: typeof data?.free_predictions_remaining === 'number'
        ? data.free_predictions_remaining
        : 10,
    }
  } catch {
    return { authenticated: false, freePredictionsRemaining: 10 }
  }
}

/**
 * Registers a new account via POST /api/auth/signup/.
 * @param {{ username: string, email?: string, password: string, passwordConfirm: string }} payload
 * @returns {Promise<{ authenticated: boolean, username: string }>}
 */
export async function signup({ username, email, password, passwordConfirm }) {
  let token = getCsrfToken()
  if (!token) {
    token = await fetchCsrfToken()
  }

  try {
    const response = await fetch(SIGNUP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        username: (username || '').trim(),
        email: (email || '').trim(),
        password: password || '',
        password_confirm: passwordConfirm || '',
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (data && data.error) {
        throw new Error(data.error)
      }
      throw new Error('Unable to create account. Please try again.')
    }

    if (!data || !data.authenticated) {
      throw new Error('Unable to create account. Please try again.')
    }

    if (data.csrfToken) {
      cachedCsrfToken = data.csrfToken
    }

    return {
      authenticated: true,
      username: data.username,
    }
  } catch (err) {
    if (
      err.message === 'Username is required.' ||
      err.message === 'That username is already taken.' ||
      err.message === 'Please enter a valid email address.' ||
      err.message === 'Password is required.' ||
      err.message === 'Please confirm your password.' ||
      err.message === 'Passwords do not match.'
    ) {
      throw err
    }
    // Network or general errors
    throw new Error(err.message || 'Unable to connect to the authentication service. Please try again.')
  }
}

/**
 * Logs in with username and password via POST /api/auth/login/.
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ authenticated: boolean, username: string }>}
 */
export async function login({ username, password }) {
  let token = getCsrfToken()
  if (!token) {
    token = await fetchCsrfToken()
  }

  try {
    const response = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        username: (username || '').trim(),
        password: password || '',
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (data && data.error) {
        throw new Error(data.error)
      }
      throw new Error('Invalid username or password.')
    }

    if (!data || !data.authenticated) {
      throw new Error('Invalid username or password.')
    }

    if (data.csrfToken) {
      cachedCsrfToken = data.csrfToken
    }

    return {
      authenticated: true,
      username: data.username,
    }
  } catch (err) {
    if (err.message === 'Invalid username or password.') {
      throw err
    }
    // Network or connection errors
    throw new Error('Unable to connect to the authentication service. Please try again.')
  }
}

/**
 * Logs out the current user via POST /api/auth/logout/.
 * @returns {Promise<{ success: boolean }>}
 */
export async function logout() {
  let token = getCsrfToken()
  if (!token) {
    token = await fetchCsrfToken()
  }

  try {
    const response = await fetch(LOGOUT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      credentials: 'same-origin',
    })
    const data = await response.json().catch(() => null)
    if (data && data.csrfToken) {
      cachedCsrfToken = data.csrfToken
    } else {
      cachedCsrfToken = null
    }
  } catch {
    cachedCsrfToken = null
  }

  return { success: true }
}
