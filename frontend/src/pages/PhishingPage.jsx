import React, { useState } from 'react'
import { Shield, Link as LinkIcon, MessageSquare, AlertCircle, RotateCcw } from 'lucide-react'
import { detectAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { simulateDemoPhishing } from '../services/demoData'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultCard from '../components/ResultCard'
import toast from 'react-hot-toast'

const URL_EXAMPLES = [
  'http://paypal-secure-login-verify.tk/account/confirm?id=9821',
  'https://www.wikipedia.org/wiki/Phishing',
]

export default function PhishingPage() {
  const { demoMode } = useAuth()
  const [mode, setMode] = useState('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyse = async (e) => {
    e.preventDefault()
    if ((mode === 'url' || mode === 'both') && !url.trim()) { toast.error('Enter a URL'); return }
    if ((mode === 'text' || mode === 'both') && !text.trim()) { toast.error('Enter email or SMS text'); return }

    setLoading(true); setResult(null)
    const payload = {}
    if (mode === 'url' || mode === 'both') payload.url = url.trim()
    if (mode === 'text' || mode === 'both') payload.text = text.trim()

    try {
      const r = await detectAPI.phishing(payload)
      setResult(r.data.data)
    } catch (err) {
      if (demoMode && (!err.response || err.response.status >= 500 || err.code === 'ERR_NETWORK')) {
        setResult(simulateDemoPhishing(payload))
      } else {
        toast.error(err.response?.data?.message || 'Phishing scan failed')
      }
    } finally { setLoading(false) }
  }

  const reset = () => {
    setUrl('')
    setText('')
    setResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Phishing Scanner</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {demoMode ? 'Demo Mode active · Sample URL & message risk simulation' : '19-feature URL analysis + text phishing detection'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <AlertCircle className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          {demoMode
            ? 'Demo Mode: Sample analysis simulates URL/text risk patterns for demonstration and does not verify the actual live safety of any URL.'
            : 'HTTPS alone does not confirm safety. This tool analyses URL structure and message patterns — not live threat databases. Always verify senders independently.'}
        </p>
      </div>

      <div className="cx-card-glow p-6 space-y-5">
        {/* Mode tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {[
            { k: 'url',  icon: LinkIcon,       label: 'URL' },
            { k: 'text', icon: MessageSquare,  label: 'Email / SMS' },
            { k: 'both', icon: Shield,         label: 'Both' },
          ].map(({ k, icon: Icon, label }) => (
            <button key={k} type="button" onClick={() => { setMode(k); setResult(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === k ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        <form onSubmit={analyse} className="space-y-4">
          {(mode === 'url' || mode === 'both') && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Suspicious URL</label>
              <input className="cx-input font-mono text-sm" placeholder="https://suspicious-site.example.com/verify…"
                value={url} onChange={e => setUrl(e.target.value)} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {URL_EXAMPLES.map(ex => (
                  <button key={ex} type="button" onClick={() => { setUrl(ex); setResult(null) }}
                    className="text-[10px] px-2.5 py-1 rounded-lg font-mono transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {ex.slice(0, 42)}…
                  </button>
                ))}
              </div>
            </div>
          )}

          {(mode === 'text' || mode === 'both') && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email / SMS Content</label>
              <textarea className="cx-textarea min-h-[140px] text-sm"
                placeholder="Paste suspicious email or SMS message here…"
                value={text} onChange={e => setText(e.target.value)} maxLength={5000} />
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="cx-btn-primary flex-1 py-3" disabled={loading}>
              {loading ? 'Scanning…' : 'Analyze URL / Scan for Phishing'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={loading || (!url && !text && !result)}
              className="cx-btn-secondary py-3 px-4"
            >
              <RotateCcw className="w-4 h-4" /> Clear
            </button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner message="Analysing URL structure…" sub="Computing 19 features: entropy, TLD, keywords, HTTPS status…" />}
      {result && !loading && <ResultCard result={result} />}
    </div>
  )
}
