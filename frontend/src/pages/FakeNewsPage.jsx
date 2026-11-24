import React, { useState } from 'react'
import { Newspaper, FileText, Link as LinkIcon, AlertCircle, RotateCcw } from 'lucide-react'
import { detectAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { simulateDemoFakeNews } from '../services/demoData'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultCard from '../components/ResultCard'
import toast from 'react-hot-toast'

const EXAMPLES = [
  { label: 'Fake example', text: 'SHOCKING BOMBSHELL: Government hiding miracle cure! Big pharma conspiracy exposed! Share before they delete this! Wake up sheeple! You wont believe what they are hiding from you!!!' },
  { label: 'Real example', text: 'According to researchers at Oxford University, a study published in Nature Medicine confirmed the new vaccine reduces infection rates by 80%. The official spokesperson released a statement confirming the data.' },
]

export default function FakeNewsPage() {
  const { demoMode } = useAuth()
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyse = async (e) => {
    e.preventDefault()
    if (mode === 'text' && !text.trim()) { toast.error('Enter article text'); return }
    if (mode === 'url' && !url.trim()) { toast.error('Enter a URL'); return }
    setLoading(true); setResult(null)
    try {
      const payload = mode === 'text' ? { text } : { url }
      const r = await detectAPI.fakeNews(payload)
      setResult(r.data.data)
    } catch (err) {
      if (demoMode && (!err.response || err.response.status >= 500 || err.code === 'ERR_NETWORK')) {
        setResult(simulateDemoFakeNews(mode === 'text' ? { text } : { url }))
      } else {
        toast.error(err.response?.data?.message || 'Analysis failed')
      }
    } finally { setLoading(false) }
  }

  const reset = () => {
    setText('')
    setUrl('')
    setResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)', boxShadow: '0 0 20px rgba(29,78,216,0.3)' }}>
          <Newspaper className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Fake News Detection</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {demoMode ? 'Demo Mode active · Sample linguistic analysis' : 'NLP + TF-IDF linguistic analysis · heuristic fallback'}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-400 leading-relaxed">
          {demoMode
            ? 'Demo Mode: Displays sample demonstration output and does not claim to be a live factual verification or production AI verdict.'
            : 'Analyses linguistic style and patterns only. Does not verify factual claims or access live sources. Always cross-check with trusted news outlets.'}
        </p>
      </div>

      {/* Form */}
      <div className="cx-card-glow p-6 space-y-5">
        {/* Mode tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {[{ k: 'text', icon: FileText, label: 'Article Text' }, { k: 'url', icon: LinkIcon, label: 'Article URL' }].map(({ k, icon: Icon, label }) => (
            <button key={k} type="button" onClick={() => { setMode(k); setResult(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === k ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        <form onSubmit={analyse} className="space-y-4">
          {mode === 'text' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                News Article / Post
              </label>
              <textarea className="cx-textarea min-h-[180px] font-mono text-sm"
                placeholder="Paste the full article text, headline, or social media post here…"
                value={text} onChange={e => setText(e.target.value)} maxLength={10000} />
              <div className="text-[10px] text-slate-600 text-right mt-1 font-mono">{text.length}/10000</div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Article URL</label>
              <input type="text" className="cx-input" placeholder="https://example.com/article…"
                value={url} onChange={e => setUrl(e.target.value)} />
              <p className="text-[10px] text-slate-600 mt-1">URL path is analysed as text. Live fetching not supported.</p>
            </div>
          )}

          {/* Quick examples */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(ex => (
              <button key={ex.label} type="button"
                onClick={() => { setMode('text'); setText(ex.text); setResult(null) }}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => e.target.style.color = '#94a3b8'}
                onMouseLeave={e => e.target.style.color = '#64748b'}>
                Try: {ex.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="submit" className="cx-btn-primary flex-1 py-3" disabled={loading}>
              {loading ? 'Analysing…' : 'Detect Fake News'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={loading || (!text && !url && !result)}
              className="cx-btn-secondary py-3 px-4"
              title="Clear input and result"
            >
              <RotateCcw className="w-4 h-4" /> Clear
            </button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner message="Running NLP analysis…" sub="Extracting linguistic features with TF-IDF" />}
      {result && !loading && <ResultCard result={result} />}
    </div>
  )
}
