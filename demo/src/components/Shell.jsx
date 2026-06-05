import { NavLink, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import LiveAI from './LiveAI.jsx'
import LangPicker from './LangPicker.jsx'

export default function Shell({ children, hideChat }) {
  const loc = useLocation()

  // Cancel any speech queued by the previous route. Prevents the table-page
  // narrator from continuing to talk after the user navigates back home (and vice versa).
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [loc.pathname])

  // Stop speech when the tab/window is hidden — no ghost narrator playing on a backgrounded tab.
  useEffect(() => {
    if (typeof document === 'undefined' || !window.speechSynthesis) return
    const onHide = () => {
      if (document.visibilityState === 'hidden') window.speechSynthesis.cancel()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', () => window.speechSynthesis.cancel())
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [])
  const ownsRail = loc.pathname.startsWith('/table/') || loc.pathname.startsWith('/fork/') || loc.pathname.startsWith('/campaign')
  const immersive = loc.pathname.startsWith('/table/')
  const showChat = !hideChat && !ownsRail

  return (
    <div className={'app-shell' + (immersive ? ' immersive' : '')}>
      {!immersive && (
        <nav className="top-nav">
          <div className="top-nav-inner">
            <Link to="/" className="nav-brand">LokaCup</Link>
            <div className="nav-links">
              <NavLink to="/" end className={({ isActive }) => 'nav-link nav-link-live' + (isActive ? ' active' : '')}>
                <span className="live-dot" aria-hidden="true" />
                Live tables
              </NavLink>
              <NavLink to="/campaign" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Campaign
              </NavLink>
            </div>
            <div className="nav-right">
              <Link to="/open" className="nav-cta nav-cta-primary">+ Open table</Link>
              <LangPicker />
              <div className="nav-user">
                <span className="nav-user-avatar" />
                <span>You</span>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className={'app-body' + (showChat ? '' : ' full')}>
        <main className="app-main">{children}</main>
        {showChat && (
          <aside className="app-chat">
            <LiveAI />
          </aside>
        )}
      </div>
    </div>
  )
}
