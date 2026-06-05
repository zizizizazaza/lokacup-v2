import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { signInWith } from '../lib/auth.js'

// Login modal — 4 methods: Google / X / Email / Web3 wallet.
// Each provider is faked: clicking immediately creates a local user.
// Email and Wallet have a tiny inline form so the user can type something.
export default function LoginModal({ onClose }) {
  const [mode, setMode] = useState('menu') // 'menu' | 'email'
  const [email, setEmail] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const finish = (method, payload) => {
    signInWith(method, payload)
    onClose()
  }

  return createPortal((
    <div className="login-backdrop" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="login-close" type="button" aria-label="Close" onClick={onClose}>×</button>

        <div className="login-head">
          <div className="login-brand">LokaCup</div>
          <h2 className="login-title">Sign in to continue</h2>
          <p className="login-sub">Join the table, lock in predictions, climb the leaderboard.</p>
        </div>

        {mode === 'menu' && (
          <div className="login-methods">
            <button className="login-method" onClick={() => finish('google')}>
              <span className="login-method-icon" aria-hidden>
                <svg viewBox="0 0 48 48" width="20" height="20"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              </span>
              <span className="login-method-label">Continue with Google</span>
            </button>

            <button className="login-method" onClick={() => finish('twitter')}>
              <span className="login-method-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2H21.5l-7.49 8.564L23 22h-6.844l-5.36-7.013L4.66 22H1.4l8.02-9.17L1 2h7.02l4.84 6.4L18.244 2zm-1.2 18h1.78L7.07 4H5.18l11.864 16z"/></svg>
              </span>
              <span className="login-method-label">Continue with X</span>
            </button>

            <button className="login-method" onClick={() => setMode('email')}>
              <span className="login-method-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
              </span>
              <span className="login-method-label">Continue with Email</span>
            </button>

            <div className="login-divider"><span>OR</span></div>

            <button className="login-method login-method-wallet" onClick={() => finish('wallet', { address: '0x8f2acafd71b3...c19d' })}>
              <span className="login-method-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V8a2 2 0 0 0-2-2H5a2 2 0 1 1 0-4h14"/><path d="M3 6v12a2 2 0 0 0 2 2h16v-4"/><circle cx="17" cy="14" r="1.5" fill="currentColor"/></svg>
              </span>
              <span className="login-method-label">Connect Web3 wallet</span>
            </button>
          </div>
        )}

        {mode === 'email' && (
          <form className="login-form" onSubmit={(e) => { e.preventDefault(); if (email.trim()) finish('email', { email: email.trim() }) }}>
            <button type="button" className="login-back" onClick={() => setMode('menu')}>← Back</button>
            <label className="login-label">Email address</label>
            <input
              className="login-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="login-submit" disabled={!email.trim()}>Send magic link</button>
            <p className="login-fineprint">We'll email you a one-time sign-in link.</p>
          </form>
        )}

        <p className="login-tos">
          By continuing you agree to LokaCup's <a href="#">Terms</a> and <a href="#">Privacy</a>.
        </p>
      </div>
    </div>
  ), document.body)
}
