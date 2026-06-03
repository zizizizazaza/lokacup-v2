import { NavLink, Link, useLocation } from 'react-router-dom'
import LiveAI from './LiveAI.jsx'

export default function Shell({ children, hideChat }) {
  const loc = useLocation()
  const ownsRail = loc.pathname.startsWith('/table/') || loc.pathname.startsWith('/fork/')
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
              <NavLink to="/forks" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                My Chat
              </NavLink>
              <NavLink to="/campaign" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Campaign
              </NavLink>
            </div>
            <div className="nav-right">
              <Link to="/open" className="nav-cta nav-cta-primary">+ Open table</Link>
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
