import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'
import { User, Mail, Calendar, Shield, Activity } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    authAPI.profile().then(r => setProfile(r.data.data)).catch(() => {})
  }, [])

  const info = profile || user
  const initial = info?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-black text-white">My Profile</h1>

      {/* Avatar card */}
      <div className="cx-card-glow p-8 text-center">
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-violet-700 blur-md opacity-50" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center text-3xl font-black text-white">
            {initial}
          </div>
        </div>
        <h2 className="text-xl font-black text-white">{info?.name}</h2>
        <p className="text-slate-500 text-sm mt-1">{info?.email}</p>
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <Shield className="w-3 h-3" /> CYBERNEX AI User
        </div>
      </div>

      {/* Details */}
      <div className="cx-card-glow p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</h3>
        {[
          { icon: User,     label: 'Full Name',    val: info?.name },
          { icon: Mail,     label: 'Email',        val: info?.email },
          { icon: Calendar, label: 'Member Since', val: info?.created_at ? new Date(info.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : 'N/A' },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} className="flex items-center gap-4 py-3 border-b last:border-b-0"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">{val || '—'}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cx-card p-4 flex items-start gap-3"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
        <Activity className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-400">
          All analyses are linked to your account. Only you can access your scan history and reports.
        </p>
      </div>
    </div>
  )
}
