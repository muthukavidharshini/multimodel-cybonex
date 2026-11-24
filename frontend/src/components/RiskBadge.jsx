import React from 'react'

const configs = {
  High:   { dot: '#ef4444', cls: 'risk-high',   label: 'HIGH RISK' },
  Medium: { dot: '#f97316', cls: 'risk-medium',  label: 'MEDIUM RISK' },
  Low:    { dot: '#22c55e', cls: 'risk-low',     label: 'LOW RISK' },
}

export default function RiskBadge({ level = 'Low', size = 'sm' }) {
  const cfg = configs[level] || configs.Low
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold tracking-wider ${cfg.cls} ${
      size === 'lg' ? 'text-xs' : 'text-[10px]'
    }`}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}
