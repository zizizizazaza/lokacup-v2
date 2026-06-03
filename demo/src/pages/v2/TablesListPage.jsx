import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TABLES } from '../../data/tables'
import { IconEye, IconFork } from '../../components/Icons.jsx'
import { withFlags, flagSrc } from '../../components/Flag.jsx'
import HeroCarousel from '../../components/HeroCarousel.jsx'

const FILTERS = ['All', 'Official', 'User', 'Hot', 'Closing soon']

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
    <div className="t-ticker">
      <span className="t-ticker-dot" />
      <div className="t-ticker-msg" key={i}>
        <span className="t-ticker-who">{m.who}</span>
        <span className="t-ticker-text">{m.text}</span>
      </div>
    </div>
  )
}

function TableCard({ t, idx }) {
  const isArb = t.market.isArb
  const isOff = t.isOfficial
  const cls = ['t-card', isArb ? 'arb' : isOff ? 'official' : 'user'].join(' ')
  const pair = pickPair(t.market.title)
  const aiA = t.market.aiConsensus
  const aiB = Math.max(0, 100 - aiA)
  const flagA = flagSrc(pair.a)
  const flagB = flagSrc(pair.b)
  const leading = aiA >= aiB ? 'a' : 'b'

  return (
    <Link to={`/table/${t.id}`} className={cls}>
      <div className="t-head">
        <div className="t-host">
          <span className="t-host-avatar">{t.host.handle.replace(/[^A-Za-z]/g, '').slice(0,2).toUpperCase()}</span>
          <span>{t.host.handle}</span>
          <span className="t-host-tag">{isOff ? 'Official' : isArb ? 'Arb' : 'User'}</span>
        </div>
        {t.status === 'live' && <span className="t-live">Live</span>}
      </div>

      <div className="t-question">{withFlags(t.market.title)}</div>

      <div className="t-versus">
        <div className="t-vs-row">
          <div className={'t-vs-side ' + (leading === 'a' ? 'lead' : '')}>
            {flagA && <img className="flag" alt="" src={flagA} />}
            <span>{pair.a}</span>
          </div>
          <div className="t-vs-side">
            <span>{pair.b}</span>
            {flagB && <img className="flag" alt="" src={flagB} />}
          </div>
        </div>
        <div className="t-vs-bar">
          <span className="t-vs-fill" style={{ width: aiA + '%' }} />
        </div>
        <div className="t-vs-row">
          <span className={'t-vs-val ' + (leading === 'a' ? 'lead' : '')}>{aiA}%</span>
          <span className={'t-vs-val ' + (leading === 'b' ? 'lead' : '')}>{aiB}%</span>
        </div>
      </div>

      <Ticker seed={idx} />

      <div className="t-foot">
        <div>
          <span className="stat"><IconEye width={14} height={14} /> {t.spectatorCount}</span>
          <span className="stat"><IconFork width={14} height={14} /> {t.forkCount}</span>
        </div>
        <span className="t-watch">Watch</span>
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

  return (
    <div>
      <HeroCarousel />

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Live tables</h2>
          <span className="section-meta">{filtered.length} matching · updated 30s ago</span>
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

    </div>
  )
}
