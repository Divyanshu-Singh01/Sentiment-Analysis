/**
 * Batch Sentiment Analysis API Service
 * Handles bulk file uploads (.csv, .xlsx) to /api/predict/batch/
 */

import { fetchCsrfToken, getCsrfToken } from './authApi'

const BATCH_ENDPOINT = import.meta?.env?.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/predict/batch/`
  : '/api/predict/batch/'

/**
 * Uploads a CSV or Excel file for bulk sentiment classification.
 * Requires an authenticated user session.
 * @param {File} file - The file to upload.
 * @param {string} [columnName] - Optional custom column name override.
 * @returns {Promise<{
 *   success: boolean,
 *   filename: string,
 *   summary: {
 *     total_rows: number,
 *     processed_rows: number,
 *     skipped_rows: number,
 *     detected_column: string,
 *     sentiment_counts: Record<string, number>,
 *     sentiment_percentages: Record<string, number>,
 *     average_confidence: number,
 *     close_predictions_count: number
 *   },
 *   preview_results: Array<{
 *     row_number: number,
 *     text: string,
 *     sentiment: string,
 *     confidence: number,
 *     is_close: boolean,
 *     status: string
 *   }>,
 *   annotated_csv: string
 * }>}
 */
export async function uploadBatchFile(file, columnName = '') {
  if (!file) {
    throw new Error('Please select a file to upload.')
  }

  let token = getCsrfToken()
  if (!token) {
    token = await fetchCsrfToken()
  }

  const formData = new FormData()
  formData.append('file', file)
  if (columnName) {
    formData.append('column', columnName)
  }

  const response = await fetch(BATCH_ENDPOINT, {
    method: 'POST',
    headers: {
      ...(token ? { 'X-CSRFToken': token } : {}),
    },
    credentials: 'same-origin',
    body: formData,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 403 && data?.error === 'auth_required') {
      const authErr = new Error(data.message || 'Log in or create an account to use Batch Upload.')
      authErr.isAuthRequired = true
      throw authErr
    }

    if (response.status === 401) {
      const sessionErr = new Error('Your session has expired. Please log in again.')
      sessionErr.isSessionExpired = true
      throw sessionErr
    }

    throw new Error(data?.message || 'Unable to process batch file. Please check file format and try again.')
  }

  return data
}
