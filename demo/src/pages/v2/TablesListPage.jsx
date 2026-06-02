import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TABLES } from '../../data/tables'
import { IconEye, IconFork } from '../../components/Icons.jsx'
import { withFlags } from '../../components/Flag.jsx'

const FILTERS = ['All', 'Official', 'User', 'Hot', 'Closing soon']

function TableCard({ t }) {
  const isArb = t.market.isArb
  const isOff = t.isOfficial
  const cls = ['table-card', isArb ? 'arb' : isOff ? 'official' : 'user'].join(' ')
  return (
    <Link to={`/table/${t.id}`} className={cls}>
      <div className="tc-head">
        <div className="tc-host">
          <span className="tc-host-avatar">{t.host.handle.replace(/[^A-Za-z]/g, '').slice(0,2).toUpperCase()}</span>
          <span>{t.host.handle}</span>
          <span className="tc-host-tag">{isOff ? 'Official' : isArb ? 'Arb' : 'User'}</span>
        </div>
        {t.status === 'live' && <span className="tc-live">Live</span>}
      </div>

      <div className="tc-question">{withFlags(t.market.title)}</div>

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
          <span className="stat"><IconEye width={14} height={14} /> {t.spectatorCount}</span>
          <span className="stat"><IconFork width={14} height={14} /> {t.forkCount}</span>
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
    if (filter === 'Hot') return t.spectatorCount > 30
    return true
  })

  const totalSpec = TABLES.reduce((sum, t) => sum + t.spectatorCount, 0)

  return (
    <div>
      <div className="banner">
        <div className="banner-content">
          <div className="banner-eyebrow">World Cup '26 · Featured pot</div>
          <h1 className="banner-title">
            Watch AI <span className="grad">predict the cup</span> in real time
          </h1>
          <p className="banner-sub">
            {TABLES.length} live tables. Polymarket and Kalshi markets debated by 4 agents — fork any conversation and run your own.
          </p>
          <div className="banner-ctas">
            <button className="banner-cta" onClick={() => navigate('/open')}>+ Open a table</button>
            <button className="banner-cta ghost">View leaderboard</button>
          </div>
          <div className="banner-stats">
            <div className="banner-stat"><div className="lbl">Volume tracked</div><div className="val">$42.8M</div></div>
            <div className="banner-stat"><div className="lbl">AI accuracy</div><div className="val">84.7%</div></div>
            <div className="banner-stat"><div className="lbl">Watching now</div><div className="val">{totalSpec}</div></div>
          </div>
        </div>
        <div className="banner-pot">
          <div className="ring">
            <div className="ring-inner">
              <div className="pot-lbl">Top pot</div>
              <div className="pot-val">$2.4M</div>
              <div className="pot-meta">{withFlags('Argentina vs Brazil')}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="tables-section">
        <div className="section-header">
          <h2 className="section-title">Live tables</h2>
          <span className="section-meta">{filtered.length} matching · sorted by heat</span>
        </div>
        <div className="tables-filter-row">
          {FILTERS.map((f) => (
            <button key={f} className={'filter-chip' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className="tables-grid">
          {filtered.map((t) => <TableCard key={t.id} t={t} />)}
        </div>
      </section>

      <button className="fab-open" onClick={() => navigate('/open')} title="Open your own table" aria-label="Open">+</button>
    </div>
  )
}
