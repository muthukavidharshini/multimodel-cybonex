import React from 'react'

export default function RiskMeter({ score = 0 }) {
  const pct = Math.min(Math.max(score, 0), 100)
  const color = pct >= 65 ? '#ef4444' : pct >= 35 ? '#f97316' : '#22c55e'
  const glow  = pct >= 65 ? 'rgba(239,68,68,0.4)' : pct >= 35 ? 'rgba(249,115,22,0.4)' : 'rgba(34,197,94,0.4)'
  const label = pct >= 65 ? 'HIGH RISK' : pct >= 35 ? 'MEDIUM RISK' : 'LOW RISK'

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Threat Score</div>
          <div className="text-4xl font-black" style={{ color }}>
            {pct.toFixed(0)}<span className="text-lg font-semibold text-slate-500">/100</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold tracking-widest px-3 py-1.5 rounded-lg"
            style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
            {label}
          </div>
        </div>
      </div>

      {/* Track */}
      <div className="cx-progress-track h-2.5">
        <div className="cx-progress-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 8px ${glow}` }} />
      </div>

      <div className="flex justify-between text-[10px] text-slate-600 font-mono">
        <span>SAFE</span>
        <span>SUSPICIOUS</span>
        <span>MALICIOUS</span>
      </div>
    </div>
  )
}
