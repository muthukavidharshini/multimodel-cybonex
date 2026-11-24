import React, { useState } from 'react'
import { Layers, Info, RotateCcw } from 'lucide-react'
import { detectAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { simulateDemoCrossModal } from '../services/demoData'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultCard from '../components/ResultCard'
import toast from 'react-hot-toast'

export default function CrossModalPage() {
  const { demoMode } = useAuth()
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const analyse = async (e) => {
    e.preventDefault()
    if (!text.trim() && !url.trim()) { toast.error('Provide text and/or a URL'); return }
    setLoading(true); setResult(null)
    const payload = {}
    if (text.trim()) payload.text = text.trim()
    if (url.trim()) payload.url = url.trim()
    if (hint) payload.detection_hint = hint
    try {
      const r = await detectAPI.crossModal(payload)
      setResult(r.data.data)
    } catch (err) {
      if (demoMode && (!err.response || err.response.status >= 500 || err.code === 'ERR_NETWORK')) {
        setResult(simulateDemoCrossModal(payload))
      } else {
        toast.error(err.response?.data?.message || 'Analysis failed')
      }
    } finally { setLoading(false) }
  }

  const reset = () => {
    setText('')
    setUrl('')
    setHint('')
    setResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0369a1, #6366f1)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Cross-Modal AI</h1>
          <p className="text-slate-500 text-xs mt-0.5">Weighted fusion of text + URL evidence modalities</p>
        </div>
      </div>

      {/* How it works */}
      <div className="cx-card p-5">
        <div className="flex gap-3 items-start mb-4">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-white mb-1">How Cross-Modal Fusion Works</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each input modality is scored independently, then combined using a weighted average.
              URL evidence (1.2×) · Text evidence (1.0×) · OCR text (0.8×).
              Missing modalities are excluded — no fabricated scores.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Text', weight: '1.0×', color: '#3b82f6' },
            { label: 'URL', weight: '1.2×', color: '#8b5cf6' },
            { label: 'OCR', weight: '0.8×', color: '#06b6d4' },
          ].map(({ label, weight, color }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
              <div className="text-xs font-bold" style={{ color }}>{label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Weight: {weight}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cx-card-glow p-6 space-y-5">
        <form onSubmit={analyse} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Text Content <span className="text-slate-600">(optional)</span>
            </label>
            <textarea className="cx-textarea min-h-[140px] text-sm"
              placeholder="News article, email body, SMS, social media post…"
              value={text} onChange={e => setText(e.target.value)} maxLength={10000} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              URL <span className="text-slate-600">(optional)</span>
            </label>
            <input className="cx-input font-mono text-sm" placeholder="https://suspicious-url.example.com…"
              value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Detection Focus <span className="text-slate-600">(optional)</span>
            </label>
            <select className="cx-select" value={hint} onChange={e => setHint(e.target.value)}>
              <option value="">Auto — run all relevant modules</option>
              <option value="fake_news">Fake News focus</option>
              <option value="phishing">Phishing focus</option>
              <option value="fraud">Fraud focus</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="cx-btn-primary flex-1 py-3" disabled={loading}>
              {loading ? 'Fusing Modalities…' : 'Run Cross-Modal Analysis'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={loading || (!text && !url && !result)}
              className="cx-btn-secondary py-3 px-4"
            >
              <RotateCcw className="w-4 h-4" /> Clear
            </button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner message="Fusing evidence across modalities…" sub="Scoring each modality independently then combining with weighted average" />}

      {result && !loading && (
        <>
          {/* Fusion badge */}
          <div className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: result.is_cross_modal ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${result.is_cross_modal ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
            <Layers className={`w-4 h-4 flex-shrink-0 ${result.is_cross_modal ? 'text-indigo-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                {result.is_cross_modal ? 'Cross-Modal Fusion Active' : 'Single Modality'}
              </div>
              <p className="text-[10px] text-slate-500">{result.fusion_note}</p>
            </div>
          </div>
          <ResultCard result={{ ...result, prediction: result.final_label }} />

          {/* Modality breakdown */}
          {Object.keys(result.modality_results || {}).length > 1 && (
            <div className="cx-card-glow p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Modality Breakdown</div>
              <div className="space-y-3">
                {Object.entries(result.modality_results).slice(0, 5).map(([key, val]) => {
                  const sc = val.risk_score || (val.fake_news || val.phishing || val.fraud)?.risk_score || 0
                  const color = sc >= 65 ? '#ef4444' : sc >= 35 ? '#f97316' : '#22c55e'
                  return (
                    <div key={key} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-black" style={{ color }}>{typeof sc === 'number' ? sc.toFixed(0) : '—'}/100</span>
                      </div>
                      <div className="cx-progress-track h-1.5">
                        <div className="cx-progress-fill" style={{ width: `${Math.min(sc, 100)}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
