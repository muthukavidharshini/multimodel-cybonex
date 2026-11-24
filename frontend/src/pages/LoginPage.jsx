import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, demoLogin, demoMode } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Enter email and password'); return }
    setLoading(true)
    try {
      const userData = await login(form.email, form.password)
      toast.success(userData?.is_demo ? 'Signed in to Demo Mode!' : 'Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error
      const networkMsg = err.code === 'ERR_NETWORK' ? 'Cannot connect to backend. Try Demo Login below.' : null
      toast.error(serverMsg || networkMsg || err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    try {
      await demoLogin()
      toast.success('Entered Demo Mode (no database required)')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start demo session')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#02040f' }}>
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to CYBERNEX AI</p>
        </div>

        {/* Demo Mode Notice */}
        <div
          className="mb-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.28)', color: '#fcd34d' }}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Demonstration Authentication:</strong>{' '}
            {demoMode
              ? 'Demo Mode is active. No MongoDB connection or real password storage is used.'
              : 'Use Demo Login below to preview the full platform without MongoDB.'}
          </div>
        </div>

        {/* Card */}
        <div className="cx-card-glow p-8 space-y-5">
          {/* One-click Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(59,130,246,0.2))',
              border: '1px solid rgba(245,158,11,0.45)',
              color: '#fde68a',
            }}
          >
            {demoLoading ? (
              <><span className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" /> Entering Demo Mode…</>
            ) : (
              <><Sparkles className="w-4 h-4 text-amber-400" /> Demo Login (No Database Required)</>
            )}
          </button>

          <div className="flex items-center gap-3 text-[11px] text-slate-600 uppercase tracking-wider">
            <div className="h-px flex-1 bg-white/10" />
            <span>or sign in with credentials</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" className="cx-input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={show ? 'text' : 'password'} className="cx-input pl-10 pr-10"
                  placeholder="Your password" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} autoComplete="current-password" />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="cx-btn-primary w-full py-3" disabled={loading || demoLoading}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            No account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
