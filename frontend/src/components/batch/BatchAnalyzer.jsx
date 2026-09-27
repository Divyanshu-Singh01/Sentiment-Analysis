import React, { useState } from 'react'
import { BatchLockedBanner } from './BatchLockedBanner'
import { BatchDropzone } from './BatchDropzone'
import { BatchResultsDashboard } from './BatchResultsDashboard'
import { SentimentError } from '../SentimentError'
import { uploadBatchFile } from '../../services/batchApi'

export function BatchAnalyzer({ user, onOpenLogin, onOpenSignup }) {
  const [batchData, setBatchData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async (file, customColumn) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await uploadBatchFile(file, customColumn)
      setBatchData(response)
    } catch (err) {
      if (err.isAuthRequired) {
        onOpenLogin?.()
        setError(err.message)
        return
      }
      setError(err.message || 'Unable to process batch file. Please check file format and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setBatchData(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* If user is not authenticated, display the locked marketing banner */}
      {!user ? (
        <BatchLockedBanner
          onOpenLogin={onOpenLogin}
          onOpenSignup={onOpenSignup}
        />
      ) : batchData ? (
        /* If analysis succeeded, show the complete interactive dashboard */
        <BatchResultsDashboard
          data={batchData}
          onReset={handleReset}
        />
      ) : (
        /* Default dropzone view for authenticated users */
        <div className="space-y-4">
          <BatchDropzone
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          {error && (
            <SentimentError
              message={error}
              onDismiss={() => setError(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}
