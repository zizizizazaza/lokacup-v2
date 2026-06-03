import { NavLink, useLocation } from 'react-router-dom'
import { IconTable, IconChat, IconCampaign, IconPlus } from './Icons.jsx'
import LiveAI from './LiveAI.jsx'

const NAV = [
  { to: '/', icon: IconTable, label: 'Live tables', count: 12 },
  { to: '/forks', icon: IconChat, label: 'My Chat' },
  { to: '/campaign', icon: IconCampaign, label: 'Campaign' },
]

const AGENTS = [
  { tone: 'lime',  name: 'Stats agent' },
  { tone: 'gold',  name: 'Odds agent' },
  { tone: 'coral', name: 'News agent' },
  { tone: 'cyan',  name: 'Tactics agent' },
]

export default function Shell({ children, hideChat }) {
  const loc = useLocation()
  // Pages that bring their own right-rail layout (e.g. table room) hide the lobby chat
  const ownsRail = loc.pathname.startsWith('/table/') || loc.pathname.startsWith('/fork/')
  const immersive = loc.pathname.startsWith('/table/')
  const showChat = !hideChat && !ownsRail
  return (
    <div className={'app-shell' + (immersive ? ' immersive' : '')}>
      {!immersive && <header className="top-bar">
        <div className="tb-brand"><span>LokaCup</span></div>
        <nav className="tb-nav">
          {NAV.map((n) => {
            const Icon = n.icon
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) => 'tb-nav-item' + (isActive ? ' active' : '')}
              >
                <span className="icon"><Icon /></span>
                <span>{n.label}</span>
                {n.count && <span className="count">{n.count}</span>}
              </NavLink>
            )
          })}
        </nav>
        <div className="tb-actions">
          <NavLink to="/open" className="tb-open-cta">
            <IconPlus width={16} height={16} />
            <span>Open table</span>
          </NavLink>
          <div className="tb-user">
            <div className="tb-avatar" />
            <div>
              <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '0.88rem', lineHeight: 1.1 }}>You</div>
              <div style={{ color: 'rgba(10,10,10,0.55)', fontSize: '0.72rem', fontWeight: 600 }}>guest · 3 forks</div>
            </div>
          </div>
        </div>
      </header>}

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
