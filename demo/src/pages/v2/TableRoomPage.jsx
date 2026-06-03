import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTable, ME_HANDLE } from '../../data/tables'
import { withFlags, flagSrc } from '../../components/Flag.jsx'
import { IconSend } from '../../components/Icons.jsx'
import PredictionRoom from '../../components/PredictionRoom.jsx'
import MainAnalysisTabs from '../../components/MainAnalysisTabs.jsx'
import { ANALYSTS } from '../../data/analysts.js'

const AGENT_TONE = {
  'Stats Analyst': 'mint',
  'Market Analyst': 'gold',
  'News Analyst': 'coral',
  'Tactics Analyst': 'cyan',
}

// Mock live match data (would come from feed)
const MATCH_EVENTS = [
  { min: 23, type: 'goal',   team: 'a', who: 'Neymar',  detail: '1-0' },
  { min: 41, type: 'goal',   team: 'b', who: 'Hakimi',  detail: '1-1' },
  { min: 58, type: 'yellow', team: 'a', who: 'Casemiro' },
  { min: 62, type: 'shot',   team: 'a', who: 'Vinícius', detail: 'off the post' },
  { min: 67, type: 'sub',    team: 'b', who: 'Ziyech', detail: 'on for En-Nesyri' },
]
const MATCH_STATS = [
  { label: 'Possession', a: 58, b: 42, unit: '%' },
  { label: 'Shots',      a: 14, b: 6 },
  { label: 'On target',  a: 6,  b: 3 },
  { label: 'xG',         a: 1.7, b: 1.1, fixed: 1 },
  { label: 'Corners',    a: 7,  b: 2 },
]
const PRICE_HISTORY = [54, 56, 55, 58, 60, 59, 62, 64, 63, 66, 68, 67, 68]
const RECENT_TRADES = [
  { side: 'YES', size: '$42k',  trader: '0xWhale…01', when: '14s' },
  { side: 'YES', size: '$8.2k', trader: '0xb31a…77', when: '52s' },
  { side: 'NO',  size: '$3.1k', trader: '0x77c2…aa', when: '1m' },
  { side: 'YES', size: '$1.4k', trader: '0x901e…f3', when: '2m' },
]

function Sparkline({ data, color = 'var(--accent-mint)' }) {
  const w = 220, h = 56, pad = 4
  const min = Math.min(...data), max = Math.max(...data)
  const span = Math.max(1, max - min)
  const step = (w - pad * 2) / (data.length - 1)
  const pts = data.map((v, i) => {
    const x = pad + i * step
    const y = pad + (h - pad * 2) - ((v - min) / span) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const area = `${pad},${h} ${pts} ${pad + (data.length - 1) * step},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-hidden>
      <polygon points={area} fill={color} opacity="0.2" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => i === data.length - 1 && (
        <circle key={i} cx={pad + i * step} cy={pad + (h - pad * 2) - ((v - min) / span) * (h - pad * 2)} r="3.5" fill={color} stroke="var(--ink)" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

const EVENT_LABEL = { goal: 'GOAL', yellow: 'YEL', red: 'RED', sub: 'SUB', shot: 'SHOT' }
function EventBadge({ type }) {
  return <span className={'ev-badge ev-' + type}>{EVENT_LABEL[type] || type}</span>
}

// Generic placeholder for "Field" / "Yes" / "No" — anything not a country
function FieldGlobe() {
  return (
    <span className="flag flag-placeholder" aria-hidden>
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    </span>
  )
}

// Mini probability chart for the right rail — 3 lines (Brazil/Morocco/Draw)
function MiniProbChart({ aiA, aiB, pairA, pairB }) {
  const SERIES = 36
  const [history, setHistory] = useState(() => {
    const out = []
    let a = aiA - 6, b = aiB - 4, d = Math.max(2, 100 - a - b)
    for (let i = 0; i < SERIES; i++) {
      a += (Math.random() - 0.5) * 2.2
      b += (Math.random() - 0.5) * 2
      d += (Math.random() - 0.5) * 1.4
      a = Math.max(8, Math.min(82, a))
      b = Math.max(8, Math.min(82, b))
      d = Math.max(3, Math.min(30, d))
      const s = a + b + d
      out.push({ a: (a / s) * 100, b: (b / s) * 100, d: (d / s) * 100 })
    }
    return out
  })
  useEffect(() => {
    const id = setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1]
        let a = last.a + (Math.random() - 0.5) * 3
        let b = last.b + (Math.random() - 0.5) * 2.5
        let d = last.d + (Math.random() - 0.5) * 1.6
        a = Math.max(8, Math.min(82, a))
        b = Math.max(8, Math.min(82, b))
        d = Math.max(3, Math.min(30, d))
        const s = a + b + d
        return [...prev.slice(-(SERIES - 1)), { a: (a / s) * 100, b: (b / s) * 100, d: (d / s) * 100 }]
      })
    }, 1500)
    return () => clearInterval(id)
  }, [])
  const w = 320, h = 140, padL = 22, padR = 42, padT = 12, padB = 18
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const step = innerW / (history.length - 1)
  const yOf = (v) => padT + innerH - (v / 100) * innerH
  const ptsA = history.map((p, i) => `${padL + i * step},${yOf(p.a)}`).join(' ')
  const ptsB = history.map((p, i) => `${padL + i * step},${yOf(p.b)}`).join(' ')
  const ptsD = history.map((p, i) => `${padL + i * step},${yOf(p.d)}`).join(' ')
  const last = history[history.length - 1]
  return (
    <div className="mpc">
      <div className="mpc-head">
        <span>AI win probability · last 36 ticks</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mpc-svg" preserveAspectRatio="none">
        {[25, 50, 75].map((g) => (
          <g key={g}>
            <line x1={padL} x2={padL + innerW} y1={yOf(g)} y2={yOf(g)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 4" />
            <text x={padL - 4} y={yOf(g) + 3} fontSize="8" textAnchor="end" fill="rgba(255,255,255,0.35)" fontFamily="var(--font-data)">{g}%</text>
          </g>
        ))}
        <polyline points={ptsD} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
        <polyline points={ptsB} fill="none" stroke="var(--accent-blue)" strokeWidth="1.6" />
        <polyline points={ptsA} fill="none" stroke="var(--accent-red)"  strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px var(--accent-red))' }} />
        {/* end dots + labels */}
        <circle cx={padL + (history.length - 1) * step} cy={yOf(last.a)} r="3" fill="var(--accent-red)" />
        <circle cx={padL + (history.length - 1) * step} cy={yOf(last.b)} r="2.5" fill="var(--accent-blue)" />
        <circle cx={padL + (history.length - 1) * step} cy={yOf(last.d)} r="2.5" fill="rgba(255,255,255,0.7)" />
        <text x={padL + innerW + 6} y={yOf(last.a) + 3} fontSize="10" fill="var(--accent-red)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.a)}%</text>
        <text x={padL + innerW + 6} y={yOf(last.b) + 3} fontSize="10" fill="var(--accent-blue)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.b)}%</text>
        <text x={padL + innerW + 6} y={yOf(last.d) + 3} fontSize="10" fill="rgba(255,255,255,0.7)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.d)}%</text>
      </svg>
      <div className="mpc-legend">
        <span className="mpc-leg bra"><i /> {pairA}</span>
        <span className="mpc-leg draw"><i /> Draw</span>
        <span className="mpc-leg mar"><i /> {pairB}</span>
      </div>
    </div>
  )
}

// Pool of "live" AI snippets the agents stream into the conversation
const AI_POOL = [
  { agent: 'Stats Analyst',   text: 'xG diff after 60′: BRA 1.7 vs MAR 1.1 — pressure cooking centrally.' },
  { agent: 'Market Analyst',  text: 'Polymarket YES drifted 58 → 61% after 62′ chance. Whale printed $42k.' },
  { agent: 'News Analyst',    text: 'Reuters: Neymar warming up. Lineup leak suggests sub at 70′.' },
  { agent: 'Tactics Analyst', text: 'MAR dropped to a back-five. Wirtz isolated — expect a sub in 8 min.' },
  { agent: 'Stats Analyst',   text: 'H2H in WC knockouts: BRA wins 4/6 over 20y, avg 1.8 goals.' },
  { agent: 'Market Analyst',  text: 'Bet365 implies 56% BRA vs Polymarket 61% — 5pt edge widening.' },
  { agent: 'Tactics Analyst', text: 'Casemiro shielding back four — killing MAR second balls (8/10 won).' },
]

// Spectator replies — friendly handles + optional badge (Twitch-style)
const REPLY_POOL = [
  { who: 'AlphaBet',       badge: 'sub',  text: 'BRA midfield looks shaky after the goal' },
  { who: 'MoroccoStan',    badge: null,   text: 'xG climbing — they could equalize again' },
  { who: 'EdgeHunter22',   badge: 'mod',  text: 'casemiro near a yellow, watch out' },
  { who: 'RefHaterX',      badge: null,   text: 'ban the ref' },
  { who: 'PolyDegen',      badge: null,   text: 'value still on BRA Yes here' },
  { who: 'VinjrBro',       badge: null,   text: 'Vinicius cooking, ngl' },
  { who: 'BotWatch',       badge: 'bot',  text: '+EV bot just bought 3k more YES' },
  { who: 'SambaScout',     badge: 'sub',  text: 'they need to slow it down, MAR will sub' },
  { who: 'lokaWhale',      badge: 'sub',  text: 'I went heavy on Over 2.5, looking good' },
  { who: 'theTacticGuy',   badge: null,   text: 'BRA wingbacks been roasting them all match' },
  { who: 'kalshiKween',    badge: null,   text: 'kalshi has it 2pt cheaper btw' },
  { who: 'midfieldMan',    badge: null,   text: 'second-balls 9/10 last 5min lol' },
]

function pickPair(title) {
  const vs = title.match(/([A-Z][a-z]+)\s+vs\s+([A-Z][a-z]+)/)
  if (vs) return { a: vs[1], b: vs[2] }
  const xWin = title.match(/^([A-Z][a-z]+)\s+to\s+/)
  if (xWin) return { a: xWin[1], b: 'Field' }
  return { a: 'Yes', b: 'No' }
}

function Message({ m }) {
  if (m.role === 'system') {
    return <div className="rc-system">{m.text}</div>
  }
  if (m.role === 'host') {
    return (
      <div className="rc-msg host">
        <div className="rc-avatar host">H</div>
        <div className="rc-body">
          <div className="rc-meta">Host</div>
          <div className="rc-bubble host">{m.text}</div>
        </div>
      </div>
    )
  }
  // AI
  const tone = AGENT_TONE[m.agent] || 'mint'
  return (
    <div className="rc-msg ai">
      <div className={'rc-avatar ai tone-' + tone}>
        <span className="bot-eye left" />
        <span className="bot-eye right" />
      </div>
      <div className="rc-body">
        <div className="rc-meta">
          <span className="rc-agent">{m.agent}</span>
          <span className="rc-time">{m.t || 'now'}</span>
        </div>
        <div className="rc-bubble ai">{m.text}</div>
      </div>
    </div>
  )
}

export default function TableRoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = getTable(id)

  // Seed conversation with the table's history + auto AI feed
  const seed = (t?.messages || []).map((m, i) =>
    m.role === 'ai'
      ? { ...m, agent: ['Stats Analyst','Market Analyst','News Analyst','Tactics Analyst'][i % 4] }
      : m
  )
  const [messages, setMessages] = useState(seed)
  const [input, setInput] = useState('')
  const [replies, setReplies] = useState(REPLY_POOL.slice(0, 5))
  const [openAnalyst, setOpenAnalyst] = useState(null)
  const counter = useRef(seed.length)
  const streamRef = useRef(null)

  // Auto-stream AI lines every ~5s — simulates the live match conversation
  useEffect(() => {
    const id = setInterval(() => {
      const pick = AI_POOL[counter.current % AI_POOL.length]
      counter.current += 1
      setMessages((prev) => [...prev.slice(-40), {
        role: 'ai',
        agent: pick.agent,
        text: pick.text,
        t: 'live · ' + (62 + counter.current) + '′',
      }])
    }, 5200)
    return () => clearInterval(id)
  }, [])

  // Auto-rotate spectator replies — append a new line every few seconds
  useEffect(() => {
    let i = 5
    const id = setInterval(() => {
      const pick = REPLY_POOL[i % REPLY_POOL.length]
      i += 1
      setReplies((prev) => [...prev.slice(-30), pick])
    }, 4200)
    return () => clearInterval(id)
  }, [])

  // Keep AI stream auto-scrolled
  useEffect(() => {
    const el = streamRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  if (!t) {
    return (
      <div>
        <p style={{ marginTop: '4rem', color: '#fff' }}>Table not found.</p>
        <button className="banner-cta ghost" onClick={() => navigate('/')}>Back to tables</button>
      </div>
    )
  }

  const pair = pickPair(t.market.title)
  const aiA = t.market.aiConsensus
  const edge = t.market.edge ?? 0
  const aiB = Math.max(0, 100 - aiA)
  const flagA = flagSrc(pair.a)
  const flagB = flagSrc(pair.b)
  const isHostMe = !t.isOfficial && t.host.handle === ME_HANDLE

  const send = () => {
    const v = input.trim()
    if (!v) return
    setMessages((p) => [...p, { role: 'host', text: v }])
    setInput('')
    // After 800ms an AI response
    setTimeout(() => {
      setMessages((p) => [...p, {
        role: 'ai',
        agent: 'Tactics Analyst',
        text: 'Re-running 4 agents with your context — give me ~5s.',
        t: 'reply',
      }])
    }, 800)
  }

  return (
    <div className="room">
      <div className="room-head">
        <button className="room-back" onClick={() => navigate('/')}>← Back</button>
        <h1 className="room-title">
          <span className="room-title-host">{t.host.handle}:</span>
          <span className="room-title-q">{t.market.title}?</span>
          {t.status === 'live' && <span className="room-title-live">Live · 67′</span>}
        </h1>
        <div className="room-meta">
          <button className="room-invite room-share" type="button" title="Share this room">
            <svg className="room-share-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
          <span className="room-pill">{t.spectatorCount} watching</span>
        </div>
      </div>

      <div className="room-body">
        {/* ── Live prediction room: scrollable prediction cards + AI thread ── */}
        <section className="room-conv scrollable">
          <div className="room-conv-top">
            <PredictionRoom />
          </div>
          <MainAnalysisTabs market={t.market} pair={pair} />
        </section>

        {/* ── Right rail: match summary + chart on top, chat full below ─ */}
        <aside className="room-rail rail-chat">
          <div className="room-card team-card">
            {/* AI conclusion — one line, no jargon */}
            <div className="ai-conclusion">
              <div className="ai-conclusion-label">AI conclusion</div>
              <div className="ai-conclusion-row">
                {flagA ? <img className="flag" alt="" src={flagA} /> : <FieldGlobe />}
                <span className="ai-conclusion-side">{pair.a}</span>
                <span className="ai-conclusion-verb">to win</span>
                <span className="ai-conclusion-prob">{aiA}%</span>
              </div>
            </div>

            {/* Analyst team — compact chips, click for details */}
            <div className="analyst-team">
              <div className="analyst-team-head">
                <span className="analyst-team-title">Analyst team</span>
                <span className="analyst-team-meta">{ANALYSTS.length} live</span>
              </div>
              <div className="analyst-chips">
                {ANALYSTS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    className="analyst-chip"
                    onClick={() => setOpenAnalyst(a)}
                  >
                    <span className={'analyst-avatar tone-' + a.tone} aria-hidden>
                      <span className="analyst-glyph">{a.glyph}</span>
                    </span>
                    <span className="analyst-chip-name">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Friends watching with you — visually distinct from analyst chips */}
            <div className="friends-bar">
              <div className="friends-bar-head">
                <span className="friends-bar-title">Analyzing with you</span>
                <span className="friends-bar-meta">3 friends</span>
              </div>
              <div className="friends-bar-row">
                <div className="friends-avatars">
                  <span className="friend-pill is-me" title="You">
                    <span className="friend-initial">Y</span>
                    <span className="friend-dot" />
                  </span>
                  <span className="friend-pill tone-pink" title="Sarah K.">
                    <span className="friend-initial">SK</span>
                    <span className="friend-dot" />
                  </span>
                  <span className="friend-pill tone-amber" title="Alex M.">
                    <span className="friend-initial">AM</span>
                    <span className="friend-dot" />
                  </span>
                  <span className="friend-pill tone-violet" title="Jordan T.">
                    <span className="friend-initial">JT</span>
                    <span className="friend-dot" />
                  </span>
                </div>
                <button type="button" className="friends-invite">+ Invite</button>
              </div>
            </div>
          </div>

          <div className="chatpane">
            <div className="chatpane-head">
              <h3>Stream chat</h3>
              <span className="chatpane-meta">{t.spectatorCount} watching</span>
            </div>
            <div className="chatpane-stream">
              {replies.map((r, i) => {
                // Stable color from username
                const colors = ['#a8ff00','#ff79c6','#7cf8ff','#facc15','#ffae4d','#d99cff','#3fe5b0','#ff6b6b','#bbd0ff','#fde047']
                let h = 0; for (let k = 0; k < r.who.length; k++) h = (h * 31 + r.who.charCodeAt(k)) >>> 0
                const c = colors[h % colors.length]
                return (
                  <div key={i} className="cp-msg">
                    {r.badge && <span className={'cp-badge bg-' + r.badge}>{r.badge === 'mod' ? 'MOD' : r.badge === 'sub' ? 'SUB' : r.badge === 'bot' ? 'BOT' : ''}</span>}
                    <span className="cp-who" style={{ color: c }}>{r.who}</span>
                    <span className="cp-colon">:</span>
                    <span className="cp-text">{r.text}</span>
                  </div>
                )
              })}
            </div>
            <div className="chatpane-input-row">
              <input className="chatpane-input" placeholder="Say something to the room…" />
              <button className="chatpane-send">Send</button>
            </div>
          </div>

        </aside>
      </div>

      {openAnalyst && (
        <div className="analyst-modal-backdrop" onClick={() => setOpenAnalyst(null)}>
          <div className="analyst-modal" onClick={(e) => e.stopPropagation()}>
            <button className="analyst-modal-close" onClick={() => setOpenAnalyst(null)} aria-label="Close">×</button>
            <div className="analyst-modal-head">
              <span className={'analyst-avatar large tone-' + openAnalyst.tone} aria-hidden>
                <span className="analyst-glyph">{openAnalyst.glyph}</span>
              </span>
              <div>
                <div className="analyst-modal-name">{openAnalyst.name}</div>
                <div className="analyst-modal-sub">{openAnalyst.specialty}</div>
              </div>
            </div>
            <div className="analyst-modal-section">
              <div className="analyst-modal-label">Focus areas</div>
              <div className="analyst-tags">
                {openAnalyst.tags.map((t) => <span key={t} className="analyst-tag">{t}</span>)}
              </div>
            </div>
            <div className="analyst-modal-section">
              <div className="analyst-modal-label">How they reason</div>
              <p className="analyst-modal-body">
                {openAnalyst.key === 'stats' && `Runs live xG, possession, and shot-quality models. Recalibrates after every event in the match.`}
                {openAnalyst.key === 'market' && `Watches Polymarket and Kalshi order flow in real time — surfaces edge when the market lags AI consensus, and flags whale prints.`}
                {openAnalyst.key === 'news' && `Pulls from lineup leaks, injury wires, ref history, and social signals. Quickest to react when external news drops mid-match.`}
                {openAnalyst.key === 'tactics' && `Reads formations, pressing intensity, and momentum shifts on the pitch. Predicts substitutions and tactical adjustments.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
