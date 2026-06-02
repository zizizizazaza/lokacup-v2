import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TABLES } from '../../data/tables'

const VIDEO_SOURCES = [
  'https://assets.mixkit.co/videos/43499/43499-720.mp4',
  'https://assets.mixkit.co/videos/43482/43482-720.mp4',
  'https://assets.mixkit.co/videos/43485/43485-720.mp4',
]
const VIDEO_POSTER = 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1920'

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

  return (
    <>
      <section className="v2-hero-compact">
        <video className="hero-video" autoPlay muted loop playsInline poster={VIDEO_POSTER}>
          {VIDEO_SOURCES.map((src) => <source key={src} src={src} type="video/mp4" />)}
        </video>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-pill">8 live tables · 309 watching now</div>
          <h1 className="hero-title">
            Predict the World Cup with <span className="grad">AI consensus</span>
          </h1>
          <p className="v2-hero-subtitle">
            Live tables, real-time multi-agent analysis. Watch the AI debate the markets, fork your own private chat, and find your edge.
          </p>
          <div className="v2-hero-ctas">
            <a href="#tables" className="v2-cta-primary">Browse live tables</a>
            <button className="v2-cta-secondary" onClick={() => navigate('/open')}>
              Open my own table
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="label">Total volume tracked</div>
              <div className="value grad">$42.8M</div>
            </div>
            <div className="hero-stat">
              <div className="label">AI accuracy (WC22)</div>
              <div className="value">84.7%</div>
            </div>
            <div className="hero-stat">
              <div className="label">Active agents</div>
              <div className="value">04</div>
            </div>
          </div>
        </div>
      </section>

      <div id="tables" className="container">
        <section className="tables-section">
          <div className="section-header">
            <h2 className="section-title">Live tables</h2>
            <div className="section-meta">
              {TABLES.length} tables · {TABLES.reduce((sum, t) => sum + t.spectatorCount, 0)} spectators
            </div>
          </div>

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
      </div>

      <button className="fab-open" onClick={() => navigate('/open')} title="Open your own table">+</button>
    </>
  )
}
