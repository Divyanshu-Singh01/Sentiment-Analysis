import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Header } from './components/Header'
import { SidebarNav } from './components/SidebarNav'
import { SentimentForm } from './components/SentimentForm'
import { SentimentResult } from './components/SentimentResult'
import { SentimentError } from './components/SentimentError'
import { InitialState } from './components/InitialState'
import { LoginForm } from './components/LoginForm'
import { SignupForm } from './components/SignupForm'
import { LimitReachedCard } from './components/LimitReachedCard'
import { UnsupportedLanguageCard } from './components/UnsupportedLanguageCard'
import { BatchAnalyzer } from './components/batch/BatchAnalyzer'
import { AnalyticsDashboard } from './components/analytics'
import { analyzeSentiment } from './services/sentimentApi'
import { checkAuthStatus, fetchCsrfToken, login, logout, signup } from './services/authApi'
import sentimentBg from './assets/backgrounds/sentiment-bg1.png'

export default function App() {
  const [user, setUser] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [freePredictionsRemaining, setFreePredictionsRemaining] = useState(10)
  const [authModal, setAuthModal] = useState(null) // null | 'login' | 'signup'
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Sentiment Analyzer state
  const [text, setText] = useState('')
  const [predictionResult, setPredictionResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unsupportedLanguage, setUnsupportedLanguage] = useState(null)
  const [activeTab, setActiveTab] = useState('single') // 'single' | 'batch' | 'analytics'

  // Session verification on app startup
  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        await fetchCsrfToken()
        const authData = await checkAuthStatus()
        if (isMounted) {
          if (authData.authenticated && authData.username) {
            setUser({ username: authData.username })
            setFreePredictionsRemaining(null)
          } else {
            setUser(null)
            setFreePredictionsRemaining(authData.freePredictionsRemaining ?? 10)
          }
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setFreePredictionsRemaining(10)
        }
      } finally {
        if (isMounted) setIsCheckingAuth(false)
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogin = async (credentials) => {
    const authData = await login(credentials)
    setUser({ username: authData.username })
    setFreePredictionsRemaining(null)
    setAuthModal(null)
    setSessionExpiredMessage(null)
    setError(null)
  }

  const handleSignup = async (payload) => {
    const authData = await signup(payload)
    setUser({ username: authData.username })
    setFreePredictionsRemaining(null)
    setAuthModal(null)
    setSessionExpiredMessage(null)
    setError(null)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      const authData = await checkAuthStatus()
      setFreePredictionsRemaining(authData.freePredictionsRemaining ?? 10)
    } finally {
      setUser(null)
      setText('')
      setPredictionResult(null)
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

    if (!text.trim()) {
      setError('Please enter some text to analyze.')
      return
    }

    setIsLoading(true)
    setPredictionResult(null)

    try {
      const data = await analyzeSentiment(text)
      setPredictionResult({ ...data, predictionId: Date.now() })
      if (typeof data.freePredictionsRemaining === 'number') {
        setFreePredictionsRemaining(data.freePredictionsRemaining)
      }
    } catch (err) {
      if (err.isLimitReached) {
        setFreePredictionsRemaining(0)
        setError(null)
        setPredictionResult(null)
        setUnsupportedLanguage(null)
        return
      }

      if (err.isSessionExpired) {
        setUser(null)
        const authData = await checkAuthStatus()
        setFreePredictionsRemaining(authData.freePredictionsRemaining ?? 10)
        setSessionExpiredMessage('Your session has expired. Please log in again.')
        setAuthModal('login')
        setPredictionResult(null)
        setError(null)
        setUnsupportedLanguage(null)
        return
      }

      if (err.isLanguageNotSupported) {
        setUnsupportedLanguage({
          message: err.message || 'Sorry, I currently support sentiment analysis for English and Hindi/Hinglish only.',
          detectedLanguage: err.detectedLanguage || null,
        })
        setPredictionResult(null)
        setError(null)
        return
      }

      setError(err.message || 'Unable to connect to the sentiment analysis service. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setText('')
    setPredictionResult(null)
    setError(null)
    setUnsupportedLanguage(null)
  }

  const isLimitBlocked = !user && freePredictionsRemaining === 0

  return (
    <div className="min-h-screen relative flex flex-col text-[#2c1a10] selection:bg-[#df8758]/30 selection:text-[#2c1a10]">
      {/* Background Image & Clean Ambient Luminous Accents */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center animate-bg-drift"
          style={{ backgroundImage: `url(${sentimentBg})` }}
        />
        {/* Soft warm champagne & golden ambient light highlights */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#f4ba93]/25 blur-[130px] animate-glow-pulse" />
        <div className="absolute top-1/2 -left-40 w-[650px] h-[650px] rounded-full bg-[#e8a374]/18 blur-[140px] animate-glow-pulse" />
      </div>

      <Header
        user={user}
        freePredictionsRemaining={freePredictionsRemaining}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        onOpenAuth={(mode) => setAuthModal(mode)}
      />

      {/* Small, compact floating corner dock (desktop) */}
      {!authModal && (
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          user={user}
        />
      )}

      <main className="flex-1 flex flex-col items-center px-4 py-6 sm:py-10">
        {isCheckingAuth ? (
          /* Subtle initial loading state while session is verified */
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#614b3f]">
            <Loader2 className="h-6 w-6 animate-spin text-[#d66524]" />
            <p className="text-xs font-medium">Loading sentiment analyzer...</p>
          </div>
        ) : authModal === 'login' ? (
          /* Explicit Login View */
          <div key="login-view" className="w-full max-w-[490px] mx-auto space-y-6 animate-result-in">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-[38px] font-bold tracking-tight text-[#22130b] drop-shadow-xs">
                Log In
              </h1>
              <p className="text-[15px] sm:text-base text-[#614b3f] max-w-md mx-auto leading-relaxed">
                Log in to your account for unlimited sentiment analysis predictions.
              </p>
            </div>

            <LoginForm
              onLogin={handleLogin}
              onSwitchToSignup={() => setAuthModal('signup')}
              onCancel={() => setAuthModal(null)}
              sessionExpiredMessage={sessionExpiredMessage}
            />
          </div>
        ) : authModal === 'signup' ? (
          /* Explicit Sign Up View */
          <div key="signup-view" className="w-full max-w-[490px] mx-auto space-y-6 animate-result-in">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-[38px] font-bold tracking-tight text-[#22130b] drop-shadow-xs">
                Create Account
              </h1>
              <p className="text-[15px] sm:text-base text-[#614b3f] max-w-md mx-auto leading-relaxed">
                Register to continue analyzing feedback with unlimited predictions.
              </p>
            </div>

            <SignupForm
              onSignup={handleSignup}
              onSwitchToLogin={() => setAuthModal('login')}
              onCancel={() => setAuthModal(null)}
            />
          </div>
        ) : activeTab === 'analytics' ? (
          /* Live Sentiment Trend Analytics View */
          <div key="analytics-view" className="w-full max-w-5xl mx-auto space-y-6 animate-result-in">
            <AnalyticsDashboard
              user={user}
              onOpenLogin={() => setAuthModal('login')}
              onOpenSignup={() => setAuthModal('signup')}
              onNavigateTab={setActiveTab}
            />
          </div>
        ) : activeTab === 'batch' ? (
          /* Batch File Upload View */
          <div key="batch-view" className="w-full max-w-4xl mx-auto space-y-6 animate-result-in">
            <div className="text-center space-y-2 pt-1">
              <h1 className="text-3xl sm:text-[38px] font-bold tracking-tight text-[#22130b]">
                Batch File{' '}
                <span className="bg-gradient-to-r from-[#d96526] via-[#ba4f1a] to-[#993b0a] bg-clip-text text-transparent">
                  Analysis
                </span>
              </h1>
              <p className="text-[15px] sm:text-base text-[#614b3f] max-w-lg mx-auto leading-relaxed">
                Upload bulk review spreadsheets (.csv, .xlsx) to classify customer sentiment across hundreds of rows.
              </p>
            </div>
            <BatchAnalyzer
              user={user}
              onOpenLogin={() => setAuthModal('login')}
              onOpenSignup={() => setAuthModal('signup')}
            />
          </div>
        ) : (
          /* Single Review Sentiment Analyzer View (Default - 100% Centered Past UI Preserved) */
          <div key="single-view" className="w-full max-w-[720px] mx-auto space-y-6 animate-result-in">
            {/* Main Centered Title & Description */}
            <div className="text-center space-y-2 pt-1">
              <h1 className="text-3xl sm:text-[38px] font-bold tracking-tight text-[#22130b] drop-shadow-xs">
                Sentiment{' '}
                <span className="bg-gradient-to-r from-[#d96526] via-[#ba4f1a] to-[#993b0a] bg-clip-text text-transparent">
                  Analysis
                </span>
              </h1>
              <p className="text-[15px] sm:text-base text-[#614b3f] max-w-md mx-auto leading-relaxed">
                Analyze customer feedback, comments, and reviews in English and Hinglish using machine learning.
              </p>
            </div>

            {/* Limit Reached Card vs Core Input Card */}
            {isLimitBlocked ? (
              <LimitReachedCard
                onOpenSignup={() => setAuthModal('signup')}
                onOpenLogin={() => setAuthModal('login')}
              />
            ) : (
              <div className="w-full">
                <SentimentForm
                  text={text}
                  setText={(newText) => {
                    setText(newText)
                    if (error) setError(null)
                    if (unsupportedLanguage) setUnsupportedLanguage(null)
                  }}
                  onSubmit={handleAnalyze}
                  onReset={handleReset}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Feedback & Results Section */}
            <div className="space-y-4 -mt-2">
              {error && (
                <SentimentError
                  message={error}
                  onDismiss={() => setError(null)}
                />
              )}

              {unsupportedLanguage && (
                <UnsupportedLanguageCard
                  message={unsupportedLanguage.message}
                  detectedLanguage={unsupportedLanguage.detectedLanguage}
                  onDismiss={() => setUnsupportedLanguage(null)}
                />
              )}

              {isLoading && (
                <div className="w-full rounded-2xl border border-[#e49b73]/40 bg-white/75 backdrop-blur-xl p-5 flex items-center justify-center gap-2.5 text-xs font-semibold text-[#3b2316] animate-result-in shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-[#d66524]" />
                  <span>Analyzing sentiment...</span>
                </div>
              )}

              {predictionResult && !error && !unsupportedLanguage && !isLoading && (
                <SentimentResult
                  key={predictionResult.predictionId || `${predictionResult.sentiment}-${predictionResult.score}`}
                  result={predictionResult}
                  onAnalyzeAnother={handleReset}
                />
              )}

              {!predictionResult && !error && !unsupportedLanguage && !isLoading && !isLimitBlocked && (
                <InitialState />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
