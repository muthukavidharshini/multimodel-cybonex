import React from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('UI Render Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: '#02040f', color: '#e2e8f0' }}
        >
          <div className="max-w-md w-full cx-card-glow p-8 text-center space-y-5">
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Something went wrong</h1>
              <p className="text-slate-400 text-sm mt-2">
                An unexpected display error occurred. Your session data was not affected.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="cx-btn-primary text-xs py-2.5 px-4"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reload Page
              </button>
              <a href="/" className="cx-btn-secondary text-xs py-2.5 px-4">
                <Home className="w-3.5 h-3.5" /> Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
