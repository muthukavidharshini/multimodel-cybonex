import React from 'react'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function IndicatorList({ indicators = [], credibilityMarkers = [] }) {
  if (!indicators.length && !credibilityMarkers.length) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm py-2">
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
        <span>No suspicious indicators detected</span>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {indicators.map((ind, i) => (
        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg"
          style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.15)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-300">{ind}</span>
        </div>
      ))}
      {credibilityMarkers.map((cm, i) => (
        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg"
          style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-green-300">Credibility signal: {cm}</span>
        </div>
      ))}
    </div>
  )
}
