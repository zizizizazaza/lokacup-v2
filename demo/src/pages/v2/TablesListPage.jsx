import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TABLES } from '../../data/tables'
import { IconEye } from '../../components/Icons.jsx'
import { withFlags, flagSrc } from '../../components/Flag.jsx'
import HeroCarousel from '../../components/HeroCarousel.jsx'

const FILTERS = ['All', 'Live']

function pickPair(title) {
  const vs = title.match(/([A-Z][a-z]+)\s+vs\s+([A-Z][a-z]+)/)
  if (vs) return { a: vs[1], b: vs[2] }
  const xWin = title.match(/^([A-Z][a-z]+)\s+to\s+/)
  if (xWin) return { a: xWin[1], b: 'Field' }
  const dashed = title.match(/—\s+([A-Z][a-z]+)$/)
  if (dashed) return { a: dashed[1], b: 'Field' }
  return { a: 'Yes', b: 'No' }
}

// Abstract SVG cover generator — geometric / comic / halftone style
function abstractCover(seed) {
  const palettes = [
    { bg: '#1a0a0a', accent: '#d91c1c', accent2: '#ff4747', mode: 'rays' },
    { bg: '#0a1a14', accent: '#a8ff00', accent2: '#5fd33a', mode: 'halftone' },
    { bg: '#0a141a', accent: '#00e5ff', accent2: '#5fb8d3', mode: 'wave' },
    { bg: '#1a1408', accent: '#facc15', accent2: '#ff9e2c', mode: 'stripes' },
    { bg: '#0e0a1a', accent: '#9f4dff', accent2: '#d91c1c', mode: 'grid' },
  ]
  const p = palettes[seed % palettes.length]
  const w = 420, h = 160
  let pattern = ''
  if (p.mode === 'rays') {
    pattern = Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2
      const x2 = w / 2 + Math.cos(a) * w
      const y2 = h / 2 + Math.sin(a) * w
      return `<line x1="${w/2}" y1="${h/2}" x2="${x2}" y2="${y2}" stroke="${p.accent}" stroke-width="42" opacity="0.18" />`
    }).join('')
  } else if (p.mode === 'halftone') {
    let s = ''
    for (let y = 0; y < h; y += 14) for (let x = 0; x < w; x += 14) {
      const r = 1 + ((x + y) / (w + h)) * 5
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.accent}" opacity="0.25" />`
    }
    pattern = s
  } else if (p.mode === 'wave') {
    pattern = Array.from({ length: 5 }).map((_, i) => {
      const yBase = (i + 1) * 28
      const d = `M 0 ${yBase} Q ${w/4} ${yBase - 20} ${w/2} ${yBase} T ${w} ${yBase}`
      return `<path d="${d}" fill="none" stroke="${p.accent}" stroke-width="3" opacity="${0.35 - i * 0.05}" />`
    }).join('')
  } else if (p.mode === 'stripes') {
    pattern = Array.from({ length: 14 }).map((_, i) => {
      return `<rect x="${i * 60 - 80}" y="-50" width="22" height="${h + 100}" fill="${p.accent}" opacity="0.18" transform="rotate(-22 ${w/2} ${h/2})" />`
    }).join('')
  } else if (p.mode === 'grid') {
    let s = ''
    for (let i = 0; i <= 14; i++) s += `<line x1="${i * 30}" y1="0" x2="${i * 30}" y2="${h}" stroke="${p.accent}" stroke-width="1" opacity="0.12" />`
    for (let j = 0; j <= 6;  j++) s += `<line x1="0" y1="${j * 30}" x2="${w}" y2="${j * 30}" stroke="${p.accent}" stroke-width="1" opacity="0.12" />`
    s += `<circle cx="${w*0.7}" cy="${h*0.45}" r="42" fill="${p.accent}" opacity="0.4" />`
    s += `<circle cx="${w*0.7}" cy="${h*0.45}" r="42" fill="none" stroke="${p.accent2}" stroke-width="2" />`
    pattern = s
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' preserveAspectRatio='xMidYMid slice'>
    <rect width='${w}' height='${h}' fill='${p.bg}' />
    <rect width='${w}' height='${h}' fill='url(#g)' />
    <defs>
      <radialGradient id='g' cx='30%' cy='30%' r='80%'>
        <stop offset='0%' stop-color='${p.accent}' stop-opacity='0.22' />
        <stop offset='100%' stop-color='${p.bg}' stop-opacity='0' />
      </radialGradient>
    </defs>
    ${pattern}
  </svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

// Mix: real KOL/streamer faces + real football photos + procedural abstracts
const COVER_POOL = [
  // Real KOL / streamer
  { src: 'https://images.pexels.com/photos/7915289/pexels-photo-7915289.jpeg?auto=compress&cs=tinysrgb&w=720', label: 'Solo cast · live mic' },
  { src: 'https://images.pexels.com/photos/3621121/pexels-photo-3621121.jpeg?auto=compress&cs=tinysrgb&w=720', label: 'Studio · KOL hot take' },
  // Real football
  { src: 'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=720', label: 'Field cam · matchday' },
  { src: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=720', label: 'Grass-level action' },
  { src: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=720', label: 'Stadium · packed house' },
  // Abstract / comic-style (procedural SVG)
  { src: abstractCover(0), label: 'Hot-take · breakdown', abstract: true },
  { src: abstractCover(1), label: 'Edge alert · agent debrief', abstract: true },
  { src: abstractCover(2), label: 'Live odds movement', abstract: true },
  { src: abstractCover(3), label: 'Tactics deep-dive', abstract: true },
  { src: abstractCover(4), label: 'Arbitrage radar', abstract: true },
]

const TICKER_POOL = [
  { who: 'Stats Agent',   text: 'xG diff 1.7 vs 1.1 — pressure mounting.' },
  { who: 'Odds Agent',    text: 'Whale just printed $42k Yes on Polymarket.' },
  { who: 'News Agent',    text: 'Lineup leak suggests sub at 70′.' },
  { who: 'Tactics Agent', text: 'DEU dropped to a back-five. Sub incoming.' },
  { who: '0xA1c3…b27e',   text: 'midfield looks shaky after the goal' },
  { who: '0x91dd…0f4a',   text: 'casemiro near a yellow, watch out' },
]

// KOL pull-quotes used by Discussion cards (cycled by table index)
const PULL_QUOTES = [
  "I'm fading BRA at 64c — read the takes inside.",
  'Mbappé over 1.5 is the spot. Bookies still asleep.',
  "Don't sleep on Argentina's BTTS — 4 of last 5.",
  'Spain U2.5 has the only +EV here. Skip the rest.',
  'Belgium 1H winner is the cleanest read of the day.',
  'USA Group arb is closing — window is ~2h.',
  'Mbappé Golden Boot at 76c is the value pick.',
  'Wait on Final winner until lineup is confirmed.',
]
const TIME_AGO = ['2h ago', '4h ago', 'yesterday', '6h ago', '11h ago', '38m ago', 'last night', '2d ago']

function Ticker({ seed }) {
  const [i, setI] = useState(seed % TICKER_POOL.length)
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % TICKER_POOL.length), 3400)
    return () => clearInterval(id)
  }, [])
  const m = TICKER_POOL[i]
  return (
    <div className="t-ticker">
      <div className="t-ticker-msg" key={i}>
        <span className="t-ticker-who">{m.who}</span>
        <span className="t-ticker-text">{m.text}</span>
      </div>
    </div>
  )
}

function LiveCard({ t, idx, cls, pair, aiA, aiB, flagA, flagB, leading }) {
  const isLive = t.status === 'live'
  return (
    <Link to={`/table/${t.id}`} className={cls + (isLive ? ' live' : ' ended') + ' no-cover'}>
      {/* Cover image hidden — see also .t-card.no-cover in v2.css. Reduce noise on the list. */}

      <div className="t-head">
        <div className="t-host">
          <span className="t-host-avatar">{t.host.handle.replace(/[^A-Za-z]/g, '').slice(0,2).toUpperCase()}</span>
          <span>{t.host.handle}</span>
        </div>
        {isLive && (
          <span className="t-head-live">
            <span className="t-head-live-dot" />
            Live
          </span>
        )}
      </div>

      <div className="t-question">{t.market.title}</div>

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
        </div>
        <span className="t-watch">Watch</span>
      </div>
    </Link>
  )
}

export function TableCard({ t, idx }) {
  const cls = 't-card'
  const pair = pickPair(t.market.title)
  const aiA = t.market.aiConsensus
  const aiB = Math.max(0, 100 - aiA)
  const flagA = flagSrc(pair.a)
  const flagB = flagSrc(pair.b)
  const leading = aiA >= aiB ? 'a' : 'b'
  return <LiveCard t={t} idx={idx} cls={cls} pair={pair} aiA={aiA} aiB={aiB} flagA={flagA} flagB={flagB} leading={leading} />
}

export default function TablesListPage() {
  const [filter, setFilter] = useState('All')
  const [team, setTeam] = useState('All')
  const navigate = useNavigate()

  // Collect every team that appears across the tables (extracted from title)
  const teams = (() => {
    const set = new Set()
    TABLES.forEach((t) => {
      const p = pickPair(t.market.title)
      if (p.a && p.a !== 'Yes' && p.a !== 'Field') set.add(p.a)
      if (p.b && p.b !== 'No' && p.b !== 'Field') set.add(p.b)
    })
    return ['All', ...Array.from(set).sort()]
  })()

  const filtered = TABLES
    .filter((t) => {
      if (filter === 'Live' && t.status !== 'live') return false
      if (filter === 'Discussion' && t.status !== 'discussion') return false
      if (team !== 'All') {
        const p = pickPair(t.market.title)
        if (p.a !== team && p.b !== team) return false
      }
      return true
    })
    .slice()
    .sort((a, b) => (b.status === 'live') - (a.status === 'live'))

  return (
    <div>
      <HeroCarousel />

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Live tables</h2>
          <div className="section-header-right">
            <span className="section-meta">{filtered.length} matching · updated 30s ago</span>
            <Link to="/open" className="nav-cta nav-cta-primary section-open-cta">+ Open table</Link>
          </div>
        </div>
        <div className="tables-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={'filter-chip filter-chip-' + f.toLowerCase() + (filter === f && team === 'All' ? ' active' : '')}
              onClick={() => { setFilter(f); setTeam('All') }}
            >
              {f === 'Live' && <span className="filter-live-dot" aria-hidden />}
              {f}
            </button>
          ))}
          {teams.filter((tm) => tm !== 'All').map((tm) => {
            const flag = flagSrc(tm)
            return (
              <button
                key={tm}
                className={'team-chip' + (team === tm ? ' active' : '')}
                onClick={() => setTeam(tm === team ? 'All' : tm)}
              >
                {flag && <img className="flag" alt="" src={flag} />}
                <span>{tm}</span>
              </button>
            )
          })}
        </div>

        <div className="tables-grid">
          {filtered.map((t, i) => <TableCard key={t.id} t={t} idx={i} />)}
        </div>
      </section>

    </div>
  )
}
