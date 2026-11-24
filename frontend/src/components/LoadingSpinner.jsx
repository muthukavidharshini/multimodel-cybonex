import React from 'react'
import { Zap } from 'lucide-react'

export default function LoadingSpinner({ message = 'Analysing threat…', sub = 'AI models processing input' }) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 animate-fade-in">
      {/* Animated rings */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/10 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="absolute inset-1 rounded-full border-2 border-blue-500/20" />
        <div className="absolute inset-1 rounded-full border-t-2 border-blue-500 animate-spin" />
        <div className="absolute inset-4 rounded-full border-t-2 border-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.9s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-5 h-5 text-blue-400" />
        </div>
      </div>
      <div className="text-center">
        <div className="text-white font-semibold">{message}</div>
        <div className="text-slate-500 text-sm mt-1">{sub}</div>
      </div>
      {/* Loading bar */}
      <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full w-1/3 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }} />
      </div>
    </div>
  )
}
