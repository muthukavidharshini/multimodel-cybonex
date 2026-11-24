import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import ErrorBoundary     from './components/ErrorBoundary'
import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import Dashboard         from './pages/Dashboard'
import FakeNewsPage      from './pages/FakeNewsPage'
import PhishingPage      from './pages/PhishingPage'
import FraudPage         from './pages/FraudPage'
import CrossModalPage    from './pages/CrossModalPage'
import ImageAnalysisPage from './pages/ImageAnalysisPage'
import HistoryPage       from './pages/HistoryPage'
import ResultPage        from './pages/ResultPage'
import ProfilePage       from './pages/ProfilePage'
import AboutPage         from './pages/AboutPage'
import AssistantPage     from './pages/AssistantPage'
import SettingsPage      from './pages/SettingsPage'
import DashboardLayout   from './layouts/DashboardLayout'

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-cyber-950" style={{ background: '#02040f' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-slate-400 text-sm">Loading CYBERNEX AI…</span>
    </div>
  </div>
)

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/about"    element={<AboutPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="fake-news"      element={<FakeNewsPage />} />
        <Route path="phishing"       element={<PhishingPage />} />
        <Route path="fraud"          element={<FraudPage />} />
        <Route path="cross-modal"    element={<CrossModalPage />} />
        <Route path="image-analysis" element={<ImageAnalysisPage />} />
        <Route path="assistant"      element={<AssistantPage />} />
        <Route path="history"        element={<HistoryPage />} />
        <Route path="results/:id"    element={<ResultPage />} />
        <Route path="profile"        element={<ProfilePage />} />
        <Route path="settings"       element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  )
}
