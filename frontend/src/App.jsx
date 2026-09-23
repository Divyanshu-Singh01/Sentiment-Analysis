import React, { useState } from 'react'
import { Header } from './components/Header'
import { SentimentForm } from './components/SentimentForm'
import { SentimentResult } from './components/SentimentResult'
import { SentimentError } from './components/SentimentError'
import { InitialState } from './components/InitialState'
import { Card } from './components/ui/Card'
import { analyzeSentiment } from './services/sentimentApi'

export default function App() {
  const [text, setText] = useState('')
  const [sentiment, setSentiment] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    // Clear previous feedback
    setError(null)

    if (!text.trim()) {
      setError('Please enter some text to analyze.')
      return
    }

    setIsLoading(true)
    setSentiment(null)

    try {
      const data = await analyzeSentiment(text)
      setSentiment(data.sentiment)
    } catch (err) {
      setError(err.message || 'Unable to connect to the sentiment analysis service. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setText('')
    setSentiment(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[700px] space-y-6">
          {/* Main Title & Description */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-[38px] font-bold tracking-tight text-slate-950">
              Sentiment Analysis
            </h1>
            <p className="text-[15px] sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
              Analyze reviews, comments, and feedback using machine learning.
            </p>
          </div>

          {/* Core Input Card */}
          <Card className="border-slate-200/90 shadow-2xs p-5 sm:p-6">
            <SentimentForm
              text={text}
              setText={(newText) => {
                setText(newText)
                if (error) setError(null)
              }}
              onSubmit={handleAnalyze}
              onReset={handleReset}
              isLoading={isLoading}
            />
          </Card>

          {/* Feedback & Results Section (Reduced top spacing to prevent empty gap) */}
          <div className="space-y-3 -mt-2">
            {error && (
              <SentimentError
                message={error}
                onDismiss={() => setError(null)}
              />
            )}

            {sentiment && !error && (
              <SentimentResult sentiment={sentiment} />
            )}

            {!sentiment && !error && !isLoading && (
              <InitialState />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/60 py-5 text-center text-xs text-slate-400">
        <div className="max-w-3xl mx-auto px-4">
          Sentiment Analysis • Powered by Machine Learning
        </div>
      </footer>
    </div>
  )
}
