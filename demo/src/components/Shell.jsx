import { NavLink } from 'react-router-dom'
import { IconTable, IconFork, IconPlus } from './Icons.jsx'
import LiveAI from './LiveAI.jsx'

const NAV = [
  { to: '/', icon: IconTable, label: 'Live tables', count: 12 },
  { to: '/forks', icon: IconFork, label: 'My forks' },
  { to: '/open', icon: IconPlus, label: 'Open table' },
]

const AGENTS = [
  { dot: 'lime', name: 'Stats agent' },
  { dot: 'gold', name: 'Odds agent' },
  { dot: 'pink', name: 'News agent' },
  { dot: 'cyan', name: 'Tactics agent' },
]

export default function Shell({ children, hideChat }) {
  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="side-brand"><span>LokaCup</span></div>

        <div>
          <div className="side-section-label">Spaces</div>
          <div className="side-nav-list">
            {NAV.map((n) => {
              const Icon = n.icon
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) => 'side-nav-item' + (isActive ? ' active' : '')}
                >
                  <span className="icon"><Icon /></span>
                  <span>{n.label}</span>
                  {n.count && <span className="count">{n.count}</span>}
                </NavLink>
              )
            })}
          </div>
        </div>

        <div>
          <div className="side-section-label">Agents</div>
          <div className="side-agents">
            {AGENTS.map((a) => (
              <div key={a.name} className="side-agent">
                <span className={'dot ' + a.dot} />
                <span>{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="side-foot">
          <div className="side-avatar" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>You</div>
            <div style={{ color: 'var(--fg-dim)', fontSize: '0.74rem' }}>guest · 3 forks</div>
          </div>
        </div>
      </aside>

      <main className="app-main">{children}</main>

      {!hideChat && (
        <aside className="app-chat">
          <LiveAI />
        </aside>
      )}
    </div>
  )
}
