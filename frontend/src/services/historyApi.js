/**
 * User Analysis History API Service
 * Communicates with the Django backend at /api/history/
 */

import { fetchCsrfToken, getCsrfToken } from './authApi'

const BASE_URL = import.meta?.env?.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : ''

const HISTORY_ENDPOINT = `${BASE_URL}/api/history/`
const CLEAR_HISTORY_ENDPOINT = `${BASE_URL}/api/history/clear/`

/**
 * Fetches the authenticated user's analysis history.
 * Supports pagination, search query, and sentiment filter.
 * @param {{ page?: number, pageSize?: number, search?: string, sentiment?: string }} params
 * @returns {Promise<{
 *   success: boolean,
 *   total_count: number,
 *   page: number,
 *   total_pages: number,
 *   page_size: number,
 *   history: Array<{
 *     id: number,
 *     text: string,
 *     sentiment: string,
 *     confidence: number,
 *     score: number,
 *     language: string,
 *     created_at: string
 *   }>
 * }>}
 */
export async function fetchHistory({ page = 1, pageSize = 20, search = '', sentiment = 'all' } = {}) {
  let token = getCsrfToken()
  if (!token) {
    token = await fetchCsrfToken()
  }

  const queryParams = new URLSearchParams()
  if (page) queryParams.set('page', String(page))
  if (pageSize) queryParams.set('page_size', String(pageSize))
  if (search && search.trim()) queryParams.set('search', search.trim())
  if (sentiment && sentiment !== 'all') queryParams.set('sentiment', sentiment.toLowerCase().trim())

  const url = `${HISTORY_ENDPOINT}?${queryParams.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      credentials: 'same-origin',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const sessionErr = new Error('Your session has expired. Please log in again.')
        sessionErr.isSessionExpired = true
        throw sessionErr
      }
      throw new Error(data?.error || data?.detail || 'Unable to load analysis history.')
    }

    return data
  } catch (err) {
    if (err.isSessionExpired) throw err
    throw new Error(err.message || 'Unable to load analysis history. Please try again.')
  }
}

/**
 * Deletes a single history record belonging to the authenticated user.
 * @param {number} historyId - The ID of the history record.
 * @returns {Promise<{ success: boolean, deleted_id: number }>}
 */
export async function deleteHistoryItem(historyId) {
  let token = getCsrfToken()
  if (!token) {
    token = await fetchCsrfToken()
  }

  const url = `${HISTORY_ENDPOINT}${historyId}/`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      credentials: 'same-origin',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const sessionErr = new Error('Your session has expired. Please log in again.')
        sessionErr.isSessionExpired = true
        throw sessionErr
      }
      throw new Error(data?.error || 'Unable to delete analysis record.')
    }

    return data
  } catch (err) {
    if (err.isSessionExpired) throw err
    throw new Error(err.message || 'Unable to delete analysis record.')
  }
}

/**
 * Clears all history records belonging to the authenticated user.
 * @returns {Promise<{ success: boolean, deleted_count: number }>}
 */
export async function clearAllHistory() {
  let token = getCsrfToken()
  if (!token) {
    token = await fetchCsrfToken()
  }

  try {
    const response = await fetch(CLEAR_HISTORY_ENDPOINT, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      credentials: 'same-origin',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const sessionErr = new Error('Your session has expired. Please log in again.')
        sessionErr.isSessionExpired = true
        throw sessionErr
      }
      throw new Error(data?.error || 'Unable to clear analysis history.')
    }

    return data
  } catch (err) {
    if (err.isSessionExpired) throw err
    throw new Error(err.message || 'Unable to clear analysis history.')
  }
}
