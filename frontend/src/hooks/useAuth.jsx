import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, healthAPI, IS_ENV_DEMO_MODE } from '../services/api'
import { DEMO_USER_DEFAULT } from '../services/demoData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(IS_ENV_DEMO_MODE)
  const [backendStatus, setBackendStatus] = useState({ checked: false, online: false, demo_mode: IS_ENV_DEMO_MODE })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        if (parsed?.is_demo) setDemoMode(true)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)

    // Probe backend health (non-blocking) to detect backend DEMO_MODE
    healthAPI
      .check()
      .then((res) => {
        const d = res.data || {}
        const backendDemo = Boolean(d.demo_mode)
        setBackendStatus({ checked: true, online: true, demo_mode: backendDemo, database: d.database })
        if (backendDemo) setDemoMode(true)
      })
      .catch(() => {
        setBackendStatus({ checked: true, online: false, demo_mode: IS_ENV_DEMO_MODE })
      })
  }, [])

  // Handle unauthorized events cleanly without reload loops
  useEffect(() => {
    const onUnauth = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
    window.addEventListener('cybernex:unauthorized', onUnauth)
    return () => window.removeEventListener('cybernex:unauthorized', onUnauth)
  }, [])

  const startLocalDemoSession = useCallback((name, email) => {
    const demoUser = {
      id: `demo-${Date.now().toString(36)}`,
      name: name || DEMO_USER_DEFAULT.name,
      email: email || DEMO_USER_DEFAULT.email,
      is_demo: true,
    }
    // Never store passwords — only ephemeral display info
    localStorage.setItem('token', `offline-demo-${Date.now()}`)
    localStorage.setItem('user', JSON.stringify(demoUser))
    setDemoMode(true)
    setUser(demoUser)
    return demoUser
  }, [])

  const demoLogin = async (customProfile = {}) => {
    try {
      const res = await authAPI.demoLogin(customProfile)
      const { token, user: userData } = res.data.data
      const finalUser = { ...userData, is_demo: true }
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(finalUser))
      setDemoMode(true)
      setUser(finalUser)
      return finalUser
    } catch (err) {
      // Fallback to temporary frontend demo session if backend is sleeping/unreachable
      if (!err.response || err.response.status >= 500 || err.response.status === 404) {
        return startLocalDemoSession(customProfile.name, customProfile.email)
      }
      throw err
    }
  }

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password })
      const { token, user: userData, is_demo } = res.data.data
      const finalUser = is_demo ? { ...userData, is_demo: true } : userData
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(finalUser))
      if (is_demo) setDemoMode(true)
      setUser(finalUser)
      return finalUser
    } catch (err) {
      // In Demo Mode, allow temporary frontend login if backend is offline or DB returns 503
      if ((demoMode || IS_ENV_DEMO_MODE) && (!err.response || err.response.status === 503 || err.code === 'ERR_NETWORK')) {
        const displayName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Demo User'
        return startLocalDemoSession(displayName, email.toLowerCase())
      }
      throw err
    }
  }

  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password })
      const { token, user: userData, is_demo } = res.data.data
      const finalUser = is_demo ? { ...userData, is_demo: true } : userData
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(finalUser))
      if (is_demo) setDemoMode(true)
      setUser(finalUser)
      return finalUser
    } catch (err) {
      // In Demo Mode, allow temporary demo registration without storing password/PII permanently
      if ((demoMode || IS_ENV_DEMO_MODE) && (!err.response || err.response.status === 503 || err.code === 'ERR_NETWORK')) {
        return startLocalDemoSession(name, email.toLowerCase())
      }
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isDemo = Boolean(demoMode || user?.is_demo)

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoMode: isDemo,
        backendStatus,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
