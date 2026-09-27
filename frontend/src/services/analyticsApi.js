/**
 * API service helper for Live Sentiment Trend Analytics.
 */

export async function fetchAnalyticsTrends({ range = '30d', category = 'all', source = 'all' } = {}) {
  const params = new URLSearchParams()
  if (range) params.append('range', range)
  if (category && category !== 'all') params.append('category', category)
  if (source && source !== 'all') params.append('source', source)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`/api/analytics/trends/${queryString}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch analytics trends.')
    error.status = response.status
    error.code = data.error
    error.isAuthRequired = response.status === 403 && data.error === 'auth_required'
    throw error
  }

  return data
}
