import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TABLES } from '../../data/tables'
import { IconEye, IconFork } from '../../components/Icons.jsx'
import { withFlags, flagSrc } from '../../components/Flag.jsx'
import BannerPitch from '../../components/BannerPitch.jsx'

const FILTERS = ['All', 'Official', 'User', 'Hot', 'Closing soon']

// Parse "A vs B …" or "X to …" titles into a binary outcome pair
function pickPair(title) {
  const vs = title.match(/([A-Z][a-z]+)\s+vs\s+([A-Z][a-z]+)/)
  if (vs) return { a: vs[1], b: vs[2] }
  const xWin = title.match(/^([A-Z][a-z]+)\s+to\s+/)
  if (xWin) return { a: xWin[1], b: 'Field' }
  const dashed = title.match(/—\s+([A-Z][a-z]+)$/)
  if (dashed) return { a: dashed[1], b: 'Field' }
  return { a: 'Yes', b: 'No' }
}

const TICKER_POOL = [
  { who: 'Stats Agent',   text: 'xG diff 1.7 vs 1.1 — pressure mounting.' },
  { who: 'Odds Agent',    text: 'Whale just printed $42k Yes on Polymarket.' },
  { who: 'News Agent',    text: 'Lineup leak suggests sub at 70′.' },
  { who: 'Tactics Agent', text: 'DEU dropped to a back-five. Sub incoming.' },
  { who: '0xA1c3…b27e',   text: 'midfield looks shaky after the goal' },
  { who: '0x91dd…0f4a',   text: 'casemiro near a yellow, watch out' },
]

function Ticker({ seed }) {
  const [i, setI] = useState(seed % TICKER_POOL.length)
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % TICKER_POOL.length), 3400)
    return () => clearInterval(id)
  }, [])
  const m = TICKER_POOL[i]
  return (
    <div className="tc-ticker">
      <span className="tc-ticker-dot" />
      <div className="tc-ticker-msg" key={i}>
        <span className="tc-ticker-who">{m.who}</span>
        <span className="tc-ticker-text">{m.text}</span>
      </div>
    </div>
  )
}

function TableCard({ t, idx }) {
  const isArb = t.market.isArb
  const isOff = t.isOfficial
  const cls = ['table-card', isArb ? 'arb' : isOff ? 'official' : 'user'].join(' ')
  const pair = pickPair(t.market.title)
  const aiA = t.market.aiConsensus
  const aiB = Math.max(0, 100 - aiA)
  const flagA = flagSrc(pair.a)
  const flagB = flagSrc(pair.b)
  const leading = aiA >= aiB ? 'a' : 'b'

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

      <div className="tc-versus">
        <div className="vs-row">
          <div className={'vs-side ' + (leading === 'a' ? 'lead' : '')}>
            {flagA && <img className="flag" alt="" src={flagA} />}
            <span className="vs-name">{pair.a}</span>
          </div>
          <div className={'vs-side right ' + (leading === 'b' ? 'lead' : '')}>
            <span className="vs-name">{pair.b}</span>
            {flagB && <img className="flag" alt="" src={flagB} />}
          </div>
        </div>
        <div className="vs-bar">
          <span className="vs-fill" style={{ width: aiA + '%' }} />
        </div>
        <div className="vs-row">
          <span className={'vs-val ' + (leading === 'a' ? 'lead' : '')}>{aiA}%</span>
          <span className={'vs-val ' + (leading === 'b' ? 'lead' : '')}>{aiB}%</span>
        </div>
      </div>

      <Ticker seed={idx} />

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
        <span className="halftone-bg" />
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
        <div className="banner-pitch-side" aria-hidden />
        <BannerPitch />
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
          {filtered.map((t, i) => <TableCard key={t.id} t={t} idx={i} />)}
        </div>
      </section>

      <button className="fab-open" onClick={() => navigate('/open')} title="Open your own table" aria-label="Open">+</button>
    </div>
  )
}
