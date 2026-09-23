/**
 * Sentiment Analysis API Service
 * Communicates with the Django backend at /api/predict/
 */

const API_ENDPOINT = import.meta?.env?.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/predict/`
  : '/api/predict/'

/**
 * Analyzes the sentiment of the provided text.
 * @param {string} text - The input text to classify.
 * @returns {Promise<{ sentiment: 'positive' | 'negative' }>}
 */
export async function analyzeSentiment(text) {
  const trimmed = (text || '').trim()

  if (!trimmed) {
    throw new Error('Please enter some text to analyze.')
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: trimmed }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (data && data.error) {
        throw new Error(data.error)
      }
      throw new Error('Unable to connect to the sentiment analysis service. Please try again.')
    }

    if (!data || typeof data.sentiment !== 'string') {
      throw new Error('Unable to connect to the sentiment analysis service. Please try again.')
    }

    return {
      sentiment: data.sentiment.toLowerCase().trim(),
    }
  } catch (err) {
    // If it's already our friendly validation or parsed backend error message, preserve it
    if (err.message === 'Please enter some text to analyze.') {
      throw err
    }
    // Network errors (e.g. backend offline, connection refused, CORS failure)
    throw new Error('Unable to connect to the sentiment analysis service. Please try again.')
  }
}
