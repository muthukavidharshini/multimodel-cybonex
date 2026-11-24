import React, { useState } from 'react'
import { Settings, Bell, Shield, Info, Moon, Zap, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({
    showConfidence: true,
    showMethod: true,
    defaultModule: 'fake_news',
    theme: 'dark',
  })

  const save = () => toast.success('Preferences saved')
  const T = (k) => () => setPrefs(p => ({ ...p, [k]: !p[k] }))

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #374151, #6b7280)' }}>
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Settings</h1>
          <p className="text-slate-500 text-xs mt-0.5">Platform preferences</p>
        </div>
      </div>

      {/* Display */}
      <div className="cx-card-glow p-6 space-y-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Display</h3>
        {[
          { key: 'showConfidence', label: 'Show confidence score on results', sub: 'Display ML prediction confidence percentage' },
          { key: 'showMethod',     label: 'Show analysis method',             sub: 'Show whether result used ML or heuristic fallback' },
        ].map(({ key, label, sub }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-200">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            </div>
            <button onClick={T(key)} className={`w-12 h-6 rounded-full transition-all flex items-center ${
              prefs[key] ? 'bg-blue-600' : 'bg-slate-700'
            }`}>
              <span className={`w-5 h-5 rounded-full bg-white shadow transition-all ${prefs[key] ? 'ml-6' : 'ml-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Default module */}
      <div className="cx-card-glow p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Default Analysis Module</h3>
        <select className="cx-select text-sm" value={prefs.defaultModule} onChange={e => setPrefs(p => ({ ...p, defaultModule: e.target.value }))}>
          <option value="fake_news">Fake News Detection</option>
          <option value="phishing">Phishing Scanner</option>
          <option value="fraud">Fraud Detection</option>
          <option value="cross_modal">Cross-Modal Analysis</option>
        </select>
        <p className="text-xs text-slate-600">The module to show first when you open the Detection section.</p>
      </div>

      {/* About */}
      <div className="cx-card p-5 space-y-3" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
        <div className="flex items-center gap-2 text-blue-400">
          <Info className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">About CYBERNEX AI</span>
        </div>
        <div className="text-xs text-slate-400 space-y-1 leading-relaxed">
          <div><span className="text-slate-500">Platform:</span> CYBERNEX AI — Unified Threat Intelligence</div>
          <div><span className="text-slate-500">Version:</span> 1.0.0</div>
          <div><span className="text-slate-500">Stack:</span> React + Vite + Flask + MongoDB + scikit-learn</div>
          <div><span className="text-slate-500">Purpose:</span> Final-year engineering project — educational use only</div>
          <div><span className="text-slate-500">AI:</span> ML heuristics — predictions are not verified threat intelligence</div>
        </div>
      </div>

      <button onClick={save} className="cx-btn-primary w-full py-3">
        <CheckCircle className="w-4 h-4" /> Save Preferences
      </button>
    </div>
  )
}
