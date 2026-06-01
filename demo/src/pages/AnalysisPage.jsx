import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const FALLBACK_MATCH = {
  id: 'bra-mar',
  league: 'Group D · MetLife Stadium',
  status: 'live',
  minute: "65'",
  home: { flag: '🇧🇷', name: 'Brazil', score: 2, form: ['W', 'W', 'D', 'W', 'L'] },
  away: { flag: '🇲🇦', name: 'Morocco', score: 1, form: ['W', 'D', 'W', 'L', 'W'] },
  h2h: 'Last 5 H2H: Brazil 3W · 1D · 1L · avg 2.4 goals',
  lineup: 'Lineups confirmed · Neymar starts · Mazraoui (MAR) out',
  events: [
    { min: "23'", text: '⚽ Neymar' },
    { min: "41'", text: '⚽ Hakimi' },
    { min: "58'", text: '⚽ Vinicius' },
    { min: "35'", text: '🟨 Casemiro' },
  ],
  stats: { poss: ['54%', '46%'], shots: ['12', '8'], onT: ['5', '3'], corners: ['6', '2'], xg: ['1.8', '0.9'] },
  weather: '☀ 24°C · Humidity 60% · Light wind',
  referee: 'Daniele Orsato (ITA) · 4.1 yellows / match',
  marketGroups: [
    {
      platform: 'Polymarket', url: 'https://polymarket.com/event/brazil-vs-morocco',
      items: [
        { q: 'Match winner', options: [['BRA', 68], ['Draw', 18], ['MAR', 14]], volNum: 1200000, url: '#', hot: true },
        { q: 'Total goals 3+', options: [['Yes', 62], ['No', 38]], volNum: 480000, url: '#' },
        { q: 'Both teams to score', options: [['Yes', 81], ['No', 19]], volNum: 310000, url: '#' },
      ],
    },
    {
      platform: 'Kalshi', url: 'https://kalshi.com/',
      items: [{ q: 'Brazil to advance to QF', options: [['Yes', 81], ['No', 19]], volNum: 210000, url: '#', hot: true }],
    },
  ],
}

const ANALYSIS = {
  injuries: {
    home: [
      { player: 'Casemiro', status: 'Doubt', detail: 'Knock at 35\' — on pitch, monitored' },
      { player: 'Alisson', status: 'Out', detail: 'Suspended (yellow accumulation)' },
    ],
    away: [
      { player: 'Mazraoui', status: 'Out', detail: 'Hamstring — confirmed out' },
      { player: 'Saiss', status: 'Risk', detail: 'On yellow card · 1 away from suspension' },
      { player: 'Ziyech', status: 'Doubt', detail: 'Late fitness test pending' },
    ],
  },
  liveStats: [
    { label: 'Possession 1H',     home: 52,  away: 48, unit: '%', kind: 'pct' },
    { label: 'Possession 2H',     home: 56,  away: 44, unit: '%', kind: 'pct' },
    { label: 'Shots in box',      home: 7,   away: 4 },
    { label: 'Shots outside box', home: 5,   away: 4 },
    { label: 'Shots on target',   home: 5,   away: 3 },
    { label: 'Dangerous attacks', home: 34,  away: 21 },
    { label: 'Corners',           home: 6,   away: 2 },
    { label: 'Offsides',          home: 2,   away: 4 },
    { label: 'Fouls',             home: 8,   away: 14 },
    { label: 'Yellow cards',      home: 1,   away: 2 },
    { label: 'Tackles won',       home: 11,  away: 16 },
    { label: 'Saves',             home: 2,   away: 4 },
    { label: 'Pass accuracy',     home: 88,  away: 74, unit: '%', kind: 'pct' },
    { label: 'xG (live)',         home: 1.8, away: 0.9 },
  ],
  goalTimeline: [
    { min: 23, side: 'home', label: 'Neymar' },
    { min: 41, side: 'away', label: 'Hakimi' },
    { min: 58, side: 'home', label: 'Vinicius' },
  ],
  xgTimeline: {
    home: [0, 0.15, 0.42, 0.81, 1.05, 1.32, 1.55, 1.8],
    away: [0, 0.08, 0.18, 0.31, 0.55, 0.68, 0.82, 0.9],
  },
  eventTiming: [
    { k: 'First goal', v: "23' (BRA)" },
    { k: 'Last goal', v: "58' (BRA)" },
    { k: 'First card', v: "35' (Casemiro)" },
    { k: 'Avg goal interval', v: '17.5 min' },
    { k: 'BRA avg 1st goal (last 5)', v: "31'" },
    { k: 'MAR avg 1st conceded (last 5)', v: "44'" },
  ],
  bookmakers: [
    { name: 'Polymarket', logo: '◆', home: 68, draw: 18, away: 14, juice: '0%' },
    { name: 'Bet365', logo: '●', home: 65, draw: 19, away: 16, juice: '5.2%' },
    { name: 'Pinnacle', logo: '◐', home: 66, draw: 18, away: 16, juice: '2.1%' },
    { name: 'DraftKings', logo: '◇', home: 64, draw: 20, away: 16, juice: '5.8%' },
  ],
  teamDeep: {
    home: {
      results: [
        { date: 'Jun 7', vs: 'vs Serbia', score: '3-0', r: 'W' },
        { date: 'Jun 3', vs: 'vs Spain', score: '1-1', r: 'D' },
        { date: 'May 28', vs: 'vs Mexico', score: '2-0', r: 'W' },
        { date: 'May 22', vs: 'vs Japan', score: '4-1', r: 'W' },
        { date: 'May 15', vs: 'vs Senegal', score: '1-2', r: 'L' },
      ],
      xg5: '2.3', xga5: '0.8', fifa: 5, elo: 1812,
      topScorer: 'Vinicius Jr. · 4 goals / 5',
    },
    away: {
      results: [
        { date: 'Jun 6', vs: 'vs Tunisia', score: '2-1', r: 'W' },
        { date: 'Jun 2', vs: 'vs Algeria', score: '0-0', r: 'D' },
        { date: 'May 27', vs: 'vs Portugal', score: '1-0', r: 'W' },
        { date: 'May 20', vs: 'vs Ghana', score: '0-1', r: 'L' },
        { date: 'May 14', vs: 'vs Egypt', score: '2-1', r: 'W' },
      ],
      xg5: '1.2', xga5: '1.0', fifa: 14, elo: 1604,
      topScorer: 'Achraf Hakimi · 3 goals / 5',
    },
  },
  catalysts: [
    { ago: '2h', icon: '🩺', text: 'Neymar passed final fitness test, confirmed starting XI', src: 'CBF official' },
    { ago: '6h', icon: '⚡', text: 'Polymarket BRA win price moved 62% → 68% (+6pt) on $180k volume', src: 'on-chain' },
    { ago: '14h', icon: '📰', text: 'Mazraoui ruled out with hamstring strain — Morocco defense weakened', src: 'Marca' },
    { ago: '18h', icon: '🌧️', text: 'MetLife forecast revised: clear, 24°C (was thunderstorm)', src: 'OpenWeather' },
    { ago: '1d', icon: '🎰', text: 'Bet365 opened market at 1.55 (64.5%), now 1.50 (66.7%)', src: 'sportsbook' },
  ],
  whales: [
    { ago: '12m', side: 'YES Brazil win', amount: '+$50k', wallet: '0xA1c3…b27e' },
    { ago: '38m', side: 'NO Total 3+', amount: '+$22k', wallet: '0x91dd…0f4a' },
    { ago: '2h', side: 'YES BTTS', amount: '+$18k', wallet: '0xCC02…91bb' },
  ],
}

function XgChart({ home, away }) {
  const W = 300, H = 80, P = 6
  const max = Math.max(...home, ...away, 0.1) * 1.1
  const toPath = (arr) =>
    arr.map((v, i) => {
      const x = P + (i / (arr.length - 1)) * (W - 2 * P)
      const y = H - P - (v / max) * (H - 2 * P)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ')
  const toArea = (arr) => `${toPath(arr)} L ${W - P} ${H - P} L ${P} ${H - P} Z`
  return (
    <svg className="xg-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path className="xg-area xg-area-home" d={toArea(home)} />
      <path className="xg-area xg-area-away" d={toArea(away)} />
      <path className="xg-line xg-line-home" d={toPath(home)} />
      <path className="xg-line xg-line-away" d={toPath(away)} />
      <text className="xg-final xg-final-home" x={W - P} y={H - P - (home[home.length - 1] / max) * (H - 2 * P) - 4} textAnchor="end">
        {home[home.length - 1].toFixed(1)}
      </text>
      <text className="xg-final xg-final-away" x={W - P} y={H - P - (away[away.length - 1] / max) * (H - 2 * P) - 4} textAnchor="end">
        {away[away.length - 1].toFixed(1)}
      </text>
    </svg>
  )
}

const FEED_POOL = [
  { team: 'home', kind: 'card',  text: 'Casemiro booked — late foul on Ziyech' },
  { team: 'home', kind: 'sub',   text: 'Vinicius OFF, Endrick ON' },
  { team: 'home', kind: 'set',   text: 'Corner awarded — 7th of the half' },
  { team: 'home', kind: 'shot',  text: 'Rodrygo shot blocked by Saiss' },
  { team: 'away', kind: 'save',  text: 'Save by Bono — diving stop low right' },
  { team: 'neutral', kind: 'var', text: 'VAR check on possible offside — play continues' },
  { team: 'home', kind: 'attack',text: 'Counter-attack — 3v2 break, cleared' },
  { team: 'away', kind: 'card',  text: 'Saiss booked — second yellow risk' },
  { team: 'away', kind: 'sub',   text: 'Mazraoui replaced by Aguerd' },
  { team: 'home', kind: 'injury',text: 'Treatment on pitch — Neymar shaken but continues' },
  { team: 'home', kind: 'set',   text: 'Free kick 25 yards out — direct shot' },
  { team: 'away', kind: 'shot',  text: 'Hakimi shot on target — comfortable for Alisson' },
  { team: 'away', kind: 'attack',text: 'Build-up down the right — overlap by En-Nesyri' },
  { team: 'home', kind: 'shot',  text: 'Vinicius curled effort just wide of post' },
]

const KIND_LABEL = {
  card: 'YELLOW',
  sub: 'SUB',
  set: 'SET PIECE',
  shot: 'SHOT',
  save: 'SAVE',
  var: 'VAR',
  attack: 'ATTACK',
  injury: 'INJURY',
}

function fmtTime(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatVol(n) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return '$' + n
}

function teamCode(name) {
  return name ? name.slice(0, 3).toUpperCase() : '—'
}

function LiveFeedTicker({ minute, match }) {
  const homeCode = teamCode(match.home.name)
  const awayCode = teamCode(match.away.name)

  const [feed, setFeed] = useState(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const t = new Date(now.getTime() - i * (3000 + Math.random() * 4000))
      const pool = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)]
      return { id: t.getTime() + '-' + i, time: fmtTime(t), min: minute - Math.floor(i / 2), ...pool }
    })
  })

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      const pool = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)]
      const ev = { id: now.getTime() + '-' + Math.random(), time: fmtTime(now), min: minute, ...pool }
      setFeed((prev) => [ev, ...prev].slice(0, 10))
    }, 3500)
    return () => clearInterval(id)
  }, [minute])

  const item = feed[0]
  const tagText = item.team === 'home' ? homeCode : item.team === 'away' ? awayCode : 'NEUTRAL'
  const tagCls = 'lf-team lf-team-' + item.team

  return (
    <div className="live-feed">
      <span className="lf-label">
        <span className="lf-dot" />
        LIVE FEED
      </span>
      <div className="lf-window">
        <div key={item.id} className="lf-row">
          <span className="lf-time">{item.time}</span>
          <span className={tagCls}>{tagText}</span>
          <span className="lf-kind">{KIND_LABEL[item.kind] || item.kind}</span>
          <span className="lf-text">{item.text}</span>
        </div>
      </div>
    </div>
  )
}

function FormDots({ form }) {
  return (
    <span className="form-dots">
      {form.map((r, i) => (
        <span key={i} className={`form-dot form-${r.toLowerCase()}`}>{r}</span>
      ))}
    </span>
  )
}

const INITIAL_MESSAGES = [
  { role: 'user', text: 'Analyze this match — who has the edge right now?' },
  {
    role: 'assistant',
    meta: 'Snapshot',
    text: "Brazil leads 2-1 at 65'. Polymarket prices the win at 68%, AI consensus 71% — modest +3pt edge.",
  },
  {
    role: 'assistant',
    meta: 'Agents',
    text: 'Data 73 · Market 68 · News 70 · Tactics 72. 4/4 agree directionally, weighted to 71%.',
  },
  {
    role: 'assistant',
    meta: 'Reasoning',
    text: "xG dominance (1.8 vs 0.9) and 4× shot count support BRA. News agent gives Mazraoui's absence extra weight. Risk: 2nd-half MAR push pattern.",
  },
]

const SUGGESTED = [
  'What happens if Morocco equalizes?',
  'Is the Total 3+ market fairly priced?',
  'Compare Polymarket vs Bet365',
]

export default function AnalysisPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const match = state?.match || FALLBACK_MATCH
  const [liveMarkets, setLiveMarkets] = useState(() =>
    (match.marketGroups || []).map((g) => ({
      ...g,
      items: g.items.map((it) => ({
        ...it,
        options: it.options.map((o) => [...o]),
        flashed: null,
      })),
    }))
  )

  useEffect(() => {
    const tick = setInterval(() => {
      setLiveMarkets((prev) => {
        const next = prev.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it, options: it.options.map((o) => [...o]) })) }))
        let groupsHit = new Set()
        const totalItems = next.reduce((s, g) => s + g.items.length, 0)
        if (totalItems === 0) return prev
        const itemsToTick = 1 + Math.floor(Math.random() * 2)
        for (let n = 0; n < itemsToTick; n++) {
          const gi = Math.floor(Math.random() * next.length)
          const it = next[gi].items[Math.floor(Math.random() * next[gi].items.length)]
          // shift one option ±1, redistribute
          const i = Math.floor(Math.random() * it.options.length)
          const delta = Math.random() < 0.5 ? -1 : 1
          const newV = Math.max(2, Math.min(98, it.options[i][1] + delta))
          const realDelta = newV - it.options[i][1]
          it.options[i][1] = newV
          // distribute -realDelta across other options proportionally
          const others = it.options.filter((_, idx) => idx !== i)
          const otherSum = others.reduce((s, o) => s + o[1], 0)
          if (otherSum > 0) {
            let remaining = -realDelta
            for (let oi = 0; oi < others.length; oi++) {
              const o = others[oi]
              const share = oi === others.length - 1 ? remaining : Math.round((-realDelta) * (o[1] / otherSum))
              o[1] = Math.max(1, o[1] + share)
              remaining -= share
            }
          }
          // bump volume
          const bump = Math.floor(1000 + Math.random() * 25000)
          it.volNum += bump
          it.flashed = delta > 0 ? 'up' : 'down'
          it.flashedAt = Date.now()
          groupsHit.add(gi)
        }
        return next
      })
    }, 2200)

    const clearFlash = setInterval(() => {
      setLiveMarkets((prev) => {
        const now = Date.now()
        let changed = false
        const next = prev.map((g) => ({
          ...g,
          items: g.items.map((it) => {
            if (it.flashed && it.flashedAt && now - it.flashedAt > 1300) {
              changed = true
              return { ...it, flashed: null, flashedAt: null }
            }
            return it
          }),
        }))
        return changed ? next : prev
      })
    }, 600)

    return () => { clearInterval(tick); clearInterval(clearFlash) }
  }, [])

  const [liveStats, setLiveStats] = useState(ANALYSIS.liveStats)
  const [minute, setMinute] = useState(parseInt(match.minute) || 65)
  const [flashed, setFlashed] = useState({})
  const [updatedAgo, setUpdatedAgo] = useState(0)
  const data = { ...ANALYSIS, liveStats }

  useEffect(() => {
    let clearFlashTimer
    const tick = () => {
      const flashes = {}
      setLiveStats((prev) => {
        const next = prev.map((s) => ({ ...s }))
        const picks = new Set()
        const count = 1 + Math.floor(Math.random() * 3)
        while (picks.size < count) picks.add(Math.floor(Math.random() * next.length))
        for (const i of picks) {
          const s = next[i]
          const delta = Math.random() < 0.5 ? -1 : 1
          if (s.kind === 'pct') {
            const newHome = Math.max(0, Math.min(100, s.home + delta))
            s.home = newHome
            s.away = 100 - newHome
          } else {
            if (Math.random() < 0.6) s.home = Math.max(0, s.home + (delta > 0 ? 1 : 0))
            else s.away = Math.max(0, s.away + (delta > 0 ? 1 : 0))
          }
          flashes[i] = delta > 0 ? 'up' : 'down'
        }
        return next
      })
      setFlashed(flashes)
      if (clearFlashTimer) clearTimeout(clearFlashTimer)
      clearFlashTimer = setTimeout(() => setFlashed({}), 1400)
      setMinute((m) => (m < 90 ? m + 1 : m))
      setUpdatedAgo(0)
    }
    const tickInterval = setInterval(tick, 4000)
    const agoInterval = setInterval(() => setUpdatedAgo((a) => a + 1), 1000)
    return () => {
      clearInterval(tickInterval)
      clearInterval(agoInterval)
      if (clearFlashTimer) clearTimeout(clearFlashTimer)
    }
  }, [])

  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')

  const analyzeQuestion = (q, platform) => {
    const prompt = `Analyze this ${platform || 'market'} question: "${q}". What is the AI consensus, and is the current market price mispriced?`
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: prompt },
      {
        role: 'assistant',
        meta: 'Analyzing',
        text: `Spinning up 4 agents for "${q}" — pulling orderbook history, news, tactics signals, and cross-book odds…`,
      },
    ])
  }

  const send = (text) => {
    const t = (text ?? input).trim()
    if (!t) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: t },
      { role: 'assistant', meta: 'Streaming', text: 'Re-running 4 agents with the new context…' },
    ])
    setInput('')
  }

  return (
    <div className="container">
      <div className="analysis-shell">
        {/* LEFT */}
        <div className="analysis-left">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back to matches</button>

          {/* 1. Match card */}
          <article className="match-card analysis-match-card">
            <div className="mc-left">
              <div className="mc-meta-row">
                <span>{match.league}</span>
                {match.status === 'live' && <span className="mc-meta-status">● Live · {match.minute}</span>}
              </div>
              <div className="mc-score-row">
                <div className="mc-team"><span className="mc-flag">{match.home.flag}</span>{match.home.name}</div>
                <div className="mc-score">{match.home.score} : {match.away.score}</div>
                <div className="mc-team away">{match.away.name}<span className="mc-flag" style={{marginLeft:'0.4rem',marginRight:0}}>{match.away.flag}</span></div>
              </div>

              <div className="mc-form-row">
                <div className="form-side"><span className="form-label">Last 5</span><FormDots form={match.home.form} /></div>
                <div className="form-side away"><FormDots form={match.away.form} /><span className="form-label">Last 5</span></div>
              </div>
              <div className="mc-h2h">{match.h2h}</div>

              <div className="mc-stats">
                {[
                  ['Poss', match.stats.poss],
                  ['Shots', match.stats.shots],
                  ['On Tgt', match.stats.onT],
                  ['Corners', match.stats.corners],
                  ['xG', match.stats.xg],
                ].map(([lbl, [a, b]]) => (
                  <div key={lbl} className="mc-stat">
                    <div className="stat-label">{lbl}</div>
                    <div className="stat-value">{a} · {b}</div>
                  </div>
                ))}
              </div>
              <div className="mc-weather">{match.weather}</div>
            </div>
            <LiveFeedTicker minute={minute} match={match} />
          </article>

          {/* 01. Top markets — hottest questions for this match */}
          <div className="analysis-block">
            <h3>
              <span className="num">01</span>
              Top markets
              <span className="live-pulse-inline" aria-hidden="true" />
            </h3>
            <div className="analysis-subhead">Live odds & volume · hover any card to analyze</div>
            {liveMarkets.map((g) => (
              <div key={g.platform} className="market-group">
                <a className="market-group-head" href={g.url} target="_blank" rel="noreferrer">
                  <span className="platform">{g.platform}</span>
                  <span className="platform-link">view all ↗</span>
                </a>
                <div className="market-tags">
                  {g.items.map((it) => (
                    <div key={it.q} className={'market-tag' + (it.hot ? ' hot' : '') + (it.flashed ? ' flash-' + it.flashed : '')}>
                      <a
                        className="tag-q tag-q-link"
                        href={it.url}
                        target="_blank"
                        rel="noreferrer"
                        title={`Open on ${g.platform}`}
                      >
                        <span className="tag-q-text">{it.q}</span>
                        <span className="tag-q-ext" aria-hidden="true">↗</span>
                      </a>
                      <div className="tag-row">
                        <div className="tag-options">
                          {it.options.map(([k, v]) => (
                            <span key={k} className="opt-chip">
                              <b className="opt-k">{k}</b>
                              <span className="opt-v">{v}%</span>
                            </span>
                          ))}
                        </div>
                        <span className="tag-vol">
                          {formatVol(it.volNum)}
                          {it.flashed && <span className={'vol-arrow vol-' + it.flashed}>{it.flashed === 'up' ? '↑' : '↓'}</span>}
                        </span>
                      </div>
                      <div className="tag-actions">
                        <button
                          className="tag-btn tag-btn-analyze"
                          onClick={() => analyzeQuestion(it.q, g.platform)}
                        >
                          <span className="tag-btn-icon">▶</span> Start analysis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 02. Whale activity */}
          <div className="analysis-block">
            <h3><span className="num">02</span>Whale activity</h3>
            <div className="analysis-subhead">Large orders on this match (last 24h)</div>
            <div className="whale-feed">
              {data.whales.map((w, i) => (
                <div key={i} className="whale-row">
                  <span className="whale-when">{w.ago}</span>
                  <span className="whale-side">{w.side}</span>
                  <span className="whale-amount">{w.amount}</span>
                  <span className="whale-wallet">{w.wallet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 03. Injuries & suspensions */}
          <div className="analysis-block">
            <h3><span className="num">03</span>Injuries & suspensions</h3>
            <div className="analysis-subhead">Real-time availability — pulled from team channels</div>
            <div className="team-deep">
              {[['home', match.home], ['away', match.away]].map(([side, team]) => (
                <div key={side} className="team-col">
                  <div className="team-col-head">
                    <span className="mc-flag">{team.flag}</span>
                    <span className="team-col-name">{team.name}</span>
                  </div>
                  {data.injuries[side].length === 0 ? (
                    <div className="injury-empty">No injuries reported</div>
                  ) : (
                    data.injuries[side].map((p, i) => (
                      <div key={i} className="injury-row">
                        <span className={`injury-status status-${p.status.toLowerCase()}`}>{p.status}</span>
                        <div className="injury-body">
                          <div className="injury-name">{p.player}</div>
                          <div className="injury-detail">{p.detail}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Extended live stats (mirrored bar viz) */}
          <div className="analysis-block">
            <h3>
              <span className="num">04</span>
              Live match stats
              <span className="live-pulse-inline" aria-hidden="true" />
              <span className="live-clock">{minute}'</span>
            </h3>
            <div className="analysis-subhead">
              Streaming · last update {updatedAgo}s ago
            </div>
            <div className="ls-legend">
              <span><span className="ls-swatch ls-swatch-home" />{match.home.name}</span>
              <span><span className="ls-swatch ls-swatch-away" />{match.away.name}</span>
            </div>
            <div className="ls-bars">
              {data.liveStats.map((s, i) => {
                const total = s.kind === 'pct' ? 100 : (s.home + s.away)
                const hPct = total === 0 ? 50 : (s.home / total) * 100
                const aPct = total === 0 ? 50 : (s.away / total) * 100
                const homeLead = s.home > s.away
                const awayLead = s.away > s.home
                const unit = s.unit || ''
                const flash = flashed[i]
                return (
                  <div key={s.label} className={'ls-bar-row' + (flash ? ' flashing flash-' + flash : '')}>
                    <span className={'ls-num ls-num-home' + (homeLead ? ' lead' : '')}>
                      {s.home}{unit}
                      {flash && <span className="flash-arrow">{flash === 'up' ? '↑' : '↓'}</span>}
                    </span>
                    <div className="ls-bar">
                      <div className="ls-bar-home" style={{ width: hPct + '%' }} />
                      <div className="ls-bar-away" style={{ width: aPct + '%' }} />
                      <span className="ls-bar-label">{s.label}</span>
                    </div>
                    <span className={'ls-num ls-num-away' + (awayLead ? ' lead' : '')}>
                      {s.away}{unit}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Goal timeline strip */}
            <div className="goal-strip-wrap">
              <div className="goal-strip-label">Goal timeline</div>
              <div className="goal-strip">
                <div className="goal-strip-bg">
                  {[15, 30, 45, 60, 75, 90].map((m) => (
                    <span key={m} className="goal-tick" style={{ left: (m / 90 * 100) + '%' }}>{m}'</span>
                  ))}
                  <span className="goal-half-line" style={{ left: '50%' }} />
                  <span className="goal-now-line" style={{ left: (minute / 90 * 100) + '%' }} />
                  <span className="goal-now-label" style={{ left: (minute / 90 * 100) + '%' }}>{minute}'</span>
                </div>
                {data.goalTimeline.map((g, i) => (
                  <div
                    key={i}
                    className={'goal-marker goal-' + g.side}
                    style={{ left: (g.min / 90 * 100) + '%' }}
                    title={`${g.label} ${g.min}'`}
                  >
                    <span className="goal-min">{g.min}'</span>
                    <span className="goal-dot">⚽</span>
                    <span className="goal-name">{g.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* xG progression mini chart */}
            <div className="xg-chart-wrap">
              <div className="goal-strip-label">xG progression</div>
              <XgChart home={data.xgTimeline.home} away={data.xgTimeline.away} />
            </div>
          </div>

          {/* 4. Event timing */}
          <div className="analysis-block">
            <h3><span className="num">05</span>Event timing</h3>
            <div className="analysis-subhead">Average event minutes — useful for live props</div>
            <div className="timing-grid">
              {data.eventTiming.map((t) => (
                <div key={t.k} className="timing-cell">
                  <div className="t-k">{t.k}</div>
                  <div className="t-v">{t.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Bookmaker comparison */}
          <div className="analysis-block">
            <h3><span className="num">06</span>Market price comparison</h3>
            <div className="analysis-subhead">Implied probability per book · juice shown where applicable</div>
            <table className="book-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Home</th>
                  <th>Draw</th>
                  <th>Away</th>
                  <th>Juice</th>
                </tr>
              </thead>
              <tbody>
                {data.bookmakers.map((b) => (
                  <tr key={b.name}>
                    <td><span className="book-logo">{b.logo}</span>{b.name}</td>
                    <td className="num">{b.home}%</td>
                    <td className="num">{b.draw}%</td>
                    <td className="num">{b.away}%</td>
                    <td className="num dim">{b.juice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 6. Team deep dive */}
          <div className="analysis-block">
            <h3><span className="num">07</span>Team deep dive (season form)</h3>
            <div className="team-deep">
              {[['home', match.home], ['away', match.away]].map(([side, team]) => {
                const d = data.teamDeep[side]
                return (
                  <div key={side} className="team-col">
                    <div className="team-col-head">
                      <span className="mc-flag">{team.flag}</span>
                      <span className="team-col-name">{team.name}</span>
                    </div>
                    <div className="team-results">
                      {d.results.map((r, i) => (
                        <div key={i} className="tr-row">
                          <span className={`tr-result form-${r.r.toLowerCase()}`}>{r.r}</span>
                          <span className="tr-vs">{r.vs}</span>
                          <span className="tr-score">{r.score}</span>
                          <span className="tr-date">{r.date}</span>
                        </div>
                      ))}
                    </div>
                    <div className="team-kpis">
                      <div className="kpi"><span className="kpi-l">xG / 5</span><span className="kpi-v">{d.xg5}</span></div>
                      <div className="kpi"><span className="kpi-l">xGA / 5</span><span className="kpi-v">{d.xga5}</span></div>
                      <div className="kpi"><span className="kpi-l">FIFA</span><span className="kpi-v">#{d.fifa}</span></div>
                      <div className="kpi"><span className="kpi-l">ELO</span><span className="kpi-v">{d.elo}</span></div>
                    </div>
                    <div className="team-scorer">⚽ {d.topScorer}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 7. Catalysts */}
          <div className="analysis-block">
            <h3><span className="num">08</span>Catalysts (24h)</h3>
            <div className="timeline">
              {data.catalysts.map((c, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-when">{c.ago}</div>
                  <div className="tl-icon">{c.icon}</div>
                  <div className="tl-body">
                    <div className="tl-text">{c.text}</div>
                    <div className="tl-src">{c.src}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <aside className="analysis-right">
          <div className="chat-shell">
            <div className="chat-header">
              <div className="chat-title">AI Analysis</div>
              <div className="chat-sub">Ask anything about this match</div>
            </div>

            <div className="chat-body">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`}>
                  {m.meta && <div className="chat-meta">{m.meta}</div>}
                  <div className="chat-bubble">{m.text}</div>
                </div>
              ))}
            </div>

            <div className="chat-suggested">
              {SUGGESTED.map((s) => (
                <button key={s} className="chat-chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>

            <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send() }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up…"
              />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}
