import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Header } from './components/Header'
import { SidebarNav } from './components/SidebarNav'
import { SentimentForm } from './components/SentimentForm'
import { SentimentResult } from './components/SentimentResult'
import { SentimentError } from './components/SentimentError'
import { LoginForm } from './components/LoginForm'
import { SignupForm } from './components/SignupForm'
import { LimitReachedCard } from './components/LimitReachedCard'
import { UnsupportedLanguageCard } from './components/UnsupportedLanguageCard'
import { BatchResultsDashboard } from './components/batch/BatchResultsDashboard'
import { AnalyticsDashboard } from './components/analytics'
import { analyzeSentiment } from './services/sentimentApi'
import { uploadBatchFile } from './services/batchApi'
import { checkAuthStatus, fetchCsrfToken, login, logout, signup } from './services/authApi'

export default function App() {
  const [user, setUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [freePredictionsRemaining, setFreePredictionsRemaining] = useState(10)
  const [authModal, setAuthModal] = useState(null)
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [text, setText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [customColumn, setCustomColumn] = useState('')
  const [predictionResult, setPredictionResult] = useState(null)
  const [batchResult, setBatchResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unsupportedLanguage, setUnsupportedLanguage] = useState(null)
  const [activeTab, setActiveTab] = useState('single')

  useEffect(() => {
    let m = true
    async function init() {
      try {
        await fetchCsrfToken()
        const d = await checkAuthStatus()
        if (m) {
          if (d.authenticated && d.username) {
            setUser({ username: d.username })
            setFreePredictionsRemaining(null)
          } else {
            setUser(null)
            setFreePredictionsRemaining(d.freePredictionsRemaining ?? 10)
          }
        }
      } catch {
        if (m) { setUser(null); setFreePredictionsRemaining(10) }
      } finally {
        if (m) setIsCheckingAuth(false)
      }
    }
    init()
    return () => { m = false }
  }, [])

  const handleLogin = async (c) => {
    const d = await login(c)
    setUser({ username: d.username })
    setFreePredictionsRemaining(null)
    setAuthModal(null)
    setSessionExpiredMessage(null)
    setError(null)
  }

  const handleSignup = async (p) => {
    const d = await signup(p)
    setUser({ username: d.username })
    setFreePredictionsRemaining(null)
    setAuthModal(null)
    setSessionExpiredMessage(null)
    setError(null)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      const d = await checkAuthStatus()
      setFreePredictionsRemaining(d.freePredictionsRemaining ?? 10)
    } finally {
      setUser(null)
      setText('')
      setSelectedFile(null)
      setCustomColumn('')
      setPredictionResult(null)
      setBatchResult(null)
      setError(null)
      setUnsupportedLanguage(null)
      setSessionExpiredMessage(null)
      setAuthModal(null)
      setIsLoggingOut(false)
    }
  }

  const handleAnalyze = async () => {
    setError(null)
    setUnsupportedLanguage(null)

    if (selectedFile) {
      if (!user) {
        setAuthModal('login')
        setSessionExpiredMessage('Sign in to process batch files.')
        return
      }
      setIsLoading(true)
      setPredictionResult(null)
      setBatchResult(null)
      try {
        setBatchResult(await uploadBatchFile(selectedFile, customColumn))
      } catch (err) {
        if (err.isAuthRequired || err.isSessionExpired) {
          setAuthModal('login')
          setSessionExpiredMessage(err.message)
          return
        }
        setError(err.message || 'Failed to process file.')
      } finally { setIsLoading(false) }
      return
    }

    if (!text.trim()) return

    setIsLoading(true)
    setPredictionResult(null)
    setBatchResult(null)
    try {
      const data = await analyzeSentiment(text)
      setPredictionResult({ ...data, predictionId: Date.now() })
      if (typeof data.freePredictionsRemaining === 'number') {
        setFreePredictionsRemaining(data.freePredictionsRemaining)
      }
    } catch (err) {
      if (err.isLimitReached) {
        setFreePredictionsRemaining(0)
        setPredictionResult(null)
        return
      }
      if (err.isSessionExpired) {
        setUser(null)
        const d = await checkAuthStatus()
        setFreePredictionsRemaining(d.freePredictionsRemaining ?? 10)
        setSessionExpiredMessage('Session expired. Please sign in again.')
        setAuthModal('login')
        setPredictionResult(null)
        return
      }
      if (err.isLanguageNotSupported) {
        setUnsupportedLanguage({
          message: err.message || 'Only English and Hindi/Hinglish are supported.',
          detectedLanguage: err.detectedLanguage || null,
        })
        setPredictionResult(null)
        return
      }
      setError(err.message || 'Analysis failed. Please try again.')
    } finally { setIsLoading(false) }
  }

  const handleReset = () => {
    setText('')
    setSelectedFile(null)
    setCustomColumn('')
    setPredictionResult(null)
    setBatchResult(null)
    setError(null)
    setUnsupportedLanguage(null)
  }

  const isLimitBlocked = !user && freePredictionsRemaining === 0 && !selectedFile

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header
        user={user}
        freePredictionsRemaining={freePredictionsRemaining}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onOpenAuth={(mode) => setAuthModal(mode)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {!authModal && (
        <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} user={user} />
      )}

      <main className={`flex-1 flex flex-col items-center px-4 w-full mx-auto ${
        activeTab === 'analytics' || batchResult ? 'max-w-6xl' : 'max-w-3xl'
      }`}>
        {isCheckingAuth ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : authModal === 'login' ? (
          <div className="w-full max-w-sm mx-auto pt-10 space-y-4 animate-result-in text-center">
            <h2 className="text-lg font-semibold text-black">Sign in to Sentiment Analysis</h2>
            <LoginForm
              onLogin={handleLogin}
              onSwitchToSignup={() => setAuthModal('signup')}
              onCancel={() => setAuthModal(null)}
              sessionExpiredMessage={sessionExpiredMessage}
            />
          </div>
        ) : authModal === 'signup' ? (
          <div className="w-full max-w-sm mx-auto pt-10 space-y-4 animate-result-in text-center">
            <h2 className="text-lg font-semibold text-black">Create your account</h2>
            <SignupForm
              onSignup={handleSignup}
              onSwitchToLogin={() => setAuthModal('login')}
              onCancel={() => setAuthModal(null)}
            />
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="w-full mx-auto pt-4 pb-12 animate-result-in">
            <AnalyticsDashboard
              user={user}
              onOpenLogin={() => setAuthModal('login')}
              onOpenSignup={() => setAuthModal('signup')}
              onNavigateTab={setActiveTab}
            />
          </div>
        ) : (
          /* ========================================= */
          /* ANALYZER: ChatGPT-style centered layout   */
          /* Input centered, results flow below        */
          /* ========================================= */
          <div className={`w-full mx-auto animate-result-in flex flex-col ${
            batchResult
              ? 'max-w-5xl pt-4 sm:pt-6 pb-12'
              : (predictionResult || error || unsupportedLanguage || isLoading || isLimitBlocked)
              ? 'max-w-xl pt-4 sm:pt-6 pb-12'
              : 'max-w-xl flex-1 justify-center py-6 sm:py-10'
          }`}>
            {/* Clean greeting when idle */}
            {!predictionResult && !batchResult && !error && !unsupportedLanguage && !isLoading && !isLimitBlocked && (
              <div className="text-center mb-6 animate-result-in space-y-1">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                  What would you like to analyze?
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
                  Detect customer sentiment from text reviews or attach a spreadsheet.
                </p>
              </div>
            )}

            {isLimitBlocked ? (
              <LimitReachedCard
                onOpenSignup={() => setAuthModal('signup')}
                onOpenLogin={() => setAuthModal('login')}
              />
            ) : (
              <SentimentForm
                text={text}
                setText={(v) => { setText(v); if (error) setError(null); if (unsupportedLanguage) setUnsupportedLanguage(null) }}
                selectedFile={selectedFile}
                setSelectedFile={(f) => { setSelectedFile(f); if (error) setError(null) }}
                customColumn={customColumn}
                setCustomColumn={setCustomColumn}
                onSubmit={handleAnalyze}
                onReset={handleReset}
                isLoading={isLoading}
                onError={setError}
              />
            )}

            {/* Results flow below the input */}
            <div className="mt-3 space-y-3">
              {error && (
                <SentimentError message={error} onDismiss={() => setError(null)} />
              )}

              {unsupportedLanguage && (
                <UnsupportedLanguageCard
                  message={unsupportedLanguage.message}
                  detectedLanguage={unsupportedLanguage.detectedLanguage}
                  onDismiss={() => setUnsupportedLanguage(null)}
                />
              )}

              {isLoading && (
                <div className="flex items-center gap-2 py-3 text-xs text-neutral-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{selectedFile ? 'Processing file...' : 'Analyzing...'}</span>
                </div>
              )}

              {predictionResult && !batchResult && !error && !unsupportedLanguage && !isLoading && (
                <SentimentResult
                  key={predictionResult.predictionId}
                  result={predictionResult}
                  onAnalyzeAnother={handleReset}
                />
              )}

              {batchResult && !error && !isLoading && (
                <BatchResultsDashboard data={batchResult} onReset={handleReset} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
