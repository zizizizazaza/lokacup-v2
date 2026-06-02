import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TABLES } from '../../data/tables'

const FILTERS = ['All', 'Official', 'User', 'Hot 🔥', 'Closing soon ⏰']

function TableCard({ t }) {
  const isArb = t.market.isArb
  const isOff = t.isOfficial
  const cls = ['table-card', isArb ? 'arb' : isOff ? 'official' : 'user'].join(' ')
  return (
    <Link to={`/table/${t.id}`} className={cls}>
      <div className="tc-head">
        <div className="tc-host">
          <span className="tc-host-avatar">{t.host.emoji}</span>
          <span>{t.host.handle}</span>
          <span className="tc-host-tag">{isOff ? 'Official' : isArb ? 'Arb' : 'User'}</span>
        </div>
        {t.status === 'live' && <span className="tc-live">LIVE</span>}
      </div>

      <div className="tc-question">{t.market.title}</div>

      <div className="tc-prices">
        <div className="tc-price-cell">
          <div className="lbl">Market</div>
          <div className="val">{t.market.currentPrice}%</div>
        </div>
        <div className="tc-price-cell">
          <div className="lbl">AI consensus</div>
          <div className="val ai">{t.market.aiConsensus}%</div>
        </div>
        <div className="tc-edge">
          <span>Edge</span>
          <span className={'val ' + (t.market.edge > 0 ? 'up' : t.market.edge < 0 ? 'down' : '')}>
            {t.market.edge > 0 ? '+' : ''}{t.market.edge}pt
          </span>
        </div>
      </div>

      <div className="tc-summary">"{t.summary}"</div>

      <div className="tc-foot">
        <div>
          <span className="stat">👀 {t.spectatorCount}</span>
          <span className="stat">🍴 {t.forkCount}</span>
        </div>
        <span className="tc-watch">Watch →</span>
      </div>
    </Link>
  )
}

export default function TablesListPage() {
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()

  const filtered = TABLES.filter((t) => {
    if (filter === 'All') return true
    if (filter === 'Official') return t.isOfficial
    if (filter === 'User') return !t.isOfficial
    if (filter === 'Hot 🔥') return t.spectatorCount > 30
    return true
  })

  const totalSpec = TABLES.reduce((sum, t) => sum + t.spectatorCount, 0)
  const totalForks = TABLES.reduce((sum, t) => sum + t.forkCount, 0)

  return (
    <div className="container">
      {/* Compact page header with stats strip */}
      <div className="tables-page-head">
        <div className="tables-page-title-row">
          <div>
            <div className="hero-pill">{TABLES.length} live tables · {totalSpec} watching now</div>
            <h1 className="tables-page-title">Live tables</h1>
            <p className="tables-page-subtitle">
              Watch the AI debate Polymarket and Kalshi markets in real time. Fork any conversation into a private chat.
            </p>
          </div>
          <button className="v2-cta-primary" onClick={() => navigate('/open')}>
            + Open my own table
          </button>
        </div>

        <div className="page-stats-strip">
          <div className="page-stat">
            <div className="label">Total volume tracked</div>
            <div className="value grad">$42.8M</div>
          </div>
          <div className="page-stat">
            <div className="label">AI accuracy (WC22)</div>
            <div className="value">84.7%</div>
          </div>
          <div className="page-stat">
            <div className="label">Active agents</div>
            <div className="value">04</div>
          </div>
          <div className="page-stat">
            <div className="label">Forks today</div>
            <div className="value">{totalForks}</div>
          </div>
        </div>
      </div>

      <section className="tables-section">
        <div className="tables-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={'filter-chip' + (filter === f ? ' active' : '')}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="tables-grid">
          {filtered.map((t) => <TableCard key={t.id} t={t} />)}
        </div>
      </section>

      <button className="fab-open" onClick={() => navigate('/open')} title="Open your own table">+</button>
    </div>
  )
}
