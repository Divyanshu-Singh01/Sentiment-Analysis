/**
 * Sentiment Analysis API Service
 * Communicates with the Django backend at /api/predict/
 */

import { fetchCsrfToken, getCsrfToken } from './authApi'

const API_ENDPOINT = import.meta?.env?.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/predict/`
  : '/api/predict/'

/**
 * Analyzes the sentiment of the provided text.
 * Allows anonymous visitors up to 10 free predictions, and unlimited for authenticated users.
 * Returns sentiment, model score, class scores, close prediction status, and remaining predictions.
 * @param {string} text - The input text to classify.
 * @returns {Promise<{
 *   sentiment: string,
 *   score: number | null,
 *   scores: Record<string, number> | null,
 *   isClose: boolean,
 *   freePredictionsRemaining?: number | null
 * }>}
 */
export async function analyzeSentiment(text) {
  const trimmed = (text || '').trim()

  if (!trimmed) {
    throw new Error('Please enter some text to analyze.')
  }

  let token = getCsrfToken()
  if (!token) {
    token = await fetchCsrfToken()
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRFToken': token } : {}),
      },
      credentials: 'same-origin',
      body: JSON.stringify({ text: trimmed }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (response.status === 403 && data && data.error === 'free_limit_reached') {
        const limitErr = new Error(
          data.message || "You've reached the 10 free predictions. Create an account or log in to continue."
        )
        limitErr.isLimitReached = true
        throw limitErr
      }

      if (response.status === 401) {
        const sessionErr = new Error('Your session has expired. Please log in again.')
        sessionErr.isSessionExpired = true
        throw sessionErr
      }

      if (data && (data.error || data.detail)) {
        const apiErr = new Error(data.error || data.detail)
        apiErr.isApiError = true
        throw apiErr
      }
      throw new Error('Unable to connect to the sentiment analysis service. Please try again.')
    }

    if (!data || typeof data.sentiment !== 'string') {
      throw new Error('Unable to connect to the sentiment analysis service. Please try again.')
    }

    return {
      sentiment: data.sentiment.toLowerCase().trim(),
      score: typeof data.score === 'number' ? data.score : null,
      scores: data.scores && typeof data.scores === 'object' ? data.scores : null,
      isClose: Boolean(data.is_close),
      freePredictionsRemaining: typeof data.free_predictions_remaining === 'number'
        ? data.free_predictions_remaining
        : null,
    }
  } catch (err) {
    if (err.isLimitReached || err.isSessionExpired || err.isApiError) {
      throw err
    }
    // If it's already our friendly validation or parsed backend error message, preserve it
    if (err.message === 'Please enter some text to analyze.') {
      throw err
    }
    // Network errors (e.g. backend offline, connection refused, CORS failure)
    throw new Error('Unable to connect to the sentiment analysis service. Please try again.')
  }
}
