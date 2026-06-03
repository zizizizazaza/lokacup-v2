import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTable, ME_HANDLE } from '../../data/tables'
import { withFlags, flagSrc } from '../../components/Flag.jsx'
import { IconSend } from '../../components/Icons.jsx'

const AGENT_TONE = { Stats: 'mint', Odds: 'gold', News: 'coral', Tactics: 'cyan' }

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

// Pool of "live" AI snippets the agents stream into the conversation
const AI_POOL = [
  { agent: 'Stats',   text: 'xG diff after 60′: BRA 1.7 vs MAR 1.1 — pressure cooking centrally.' },
  { agent: 'Odds',    text: 'Polymarket YES drifted 58 → 61% after 62′ chance. Whale printed $42k.' },
  { agent: 'News',    text: 'Reuters: Neymar warming up. Lineup leak suggests sub at 70′.' },
  { agent: 'Tactics', text: 'MAR dropped to a back-five. Wirtz isolated — expect a sub in 8 min.' },
  { agent: 'Stats',   text: 'H2H in WC knockouts: BRA wins 4/6 over 20y, avg 1.8 goals.' },
  { agent: 'Odds',    text: 'Bet365 implies 56% BRA vs Polymarket 61% — 5pt edge widening.' },
  { agent: 'Tactics', text: 'Casemiro shielding back four — killing MAR second balls (8/10 won).' },
]

// Spectator replies (live chat from viewers)
const REPLY_POOL = [
  { who: '0xA1c3…b27e', text: 'BRA midfield looks shaky after the goal' },
  { who: '0xB244…1f89', text: 'MAR xG climbing — they could equalize again' },
  { who: '0x91dd…0f4a', text: 'casemiro near a yellow, watch out' },
  { who: '0xc8e1…0a22', text: 'ban the ref' },
  { who: '0x2f01…ee44', text: 'value still on BRA Yes here' },
  { who: '0x88d9…1bcd', text: 'Vinicius cooking, ngl' },
  { who: '0xff03…aabb', text: '+EV bot just bought 3k more YES' },
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
          <span className="rc-agent">{m.agent} Agent</span>
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
    m.role === 'ai' ? { ...m, agent: ['Stats','Odds','News','Tactics'][i % 4] } : m
  )
  const [messages, setMessages] = useState(seed)
  const [input, setInput] = useState('')
  const [replies, setReplies] = useState(REPLY_POOL.slice(0, 5))
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
        agent: 'Tactics',
        text: 'Re-running 4 agents with your context — give me ~5s.',
        t: 'reply',
      }])
    }, 800)
  }

  return (
    <div className="room">
      <div className="room-head">
        <button className="room-back" onClick={() => navigate('/')}>← Back</button>
        <h1 className="room-title">{withFlags(t.market.title)}</h1>
        <div className="room-meta">
          {t.status === 'live' && <span className="room-live">Live · 67′</span>}
          <span className="room-pill">{t.spectatorCount} watching</span>
        </div>
      </div>

      <div className="room-body">
        {/* ── Conversation ───────────────────────── */}
        <section className="room-conv">
          <div className="room-card-head">
            <h3>AI live debate</h3>
            <span className="room-card-sub">Stats · Odds · News · Tactics — streaming</span>
          </div>
          <div className="rc-stream" ref={streamRef}>
            {messages.map((m, i) => <Message key={i} m={m} />)}
          </div>
          <div className="rc-input-row">
            <button className="rc-mic" title="Push to talk" aria-label="Voice">●</button>
            <input
              className="rc-input"
              placeholder={isHostMe ? 'Type or hold mic to talk to the agents…' : 'Only the host can speak — Fork to ask privately.'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={!isHostMe && !t.isOfficial /* allow input during official tables in demo */}
            />
            <button className="rc-send" onClick={send} aria-label="Send"><IconSend width={16} height={16} /></button>
          </div>
        </section>

        {/* ── Right rail: match info + market + spectator replies ── */}
        <aside className="room-rail">

          <div className="room-card match">
            <div className="room-card-head"><h3>Match</h3></div>
            <div className="match-block">
              <div className="match-team">
                {flagA && <img className="flag" alt="" src={flagA} />}
                <div className="match-team-name">{pair.a}</div>
              </div>
              <div className="match-score">
                <div className="ms-vals">2 — 1</div>
                <div className="ms-time">67′</div>
              </div>
              <div className="match-team right">
                {flagB && <img className="flag" alt="" src={flagB} />}
                <div className="match-team-name">{pair.b}</div>
              </div>
            </div>
            <div className="match-prob">
              <div className="prob-line"><span>{pair.a} win</span><span>{aiA}%</span></div>
              <div className="vs-bar"><span className="vs-fill" style={{ width: aiA + '%' }} /></div>
              <div className="prob-line"><span>{pair.b} win</span><span>{aiB}%</span></div>
            </div>

            <div className="match-stats">
              {MATCH_STATS.map((s) => {
                const total = s.a + s.b || 1
                return (
                  <div key={s.label} className="ms-row">
                    <span className="ms-a">{s.fixed != null ? s.a.toFixed(s.fixed) : s.a}{s.unit || ''}</span>
                    <div className="ms-bar">
                      <span className="ms-bar-a" style={{ width: (s.a / total * 100) + '%' }} />
                      <span className="ms-bar-b" style={{ width: (s.b / total * 100) + '%' }} />
                    </div>
                    <span className="ms-b">{s.fixed != null ? s.b.toFixed(s.fixed) : s.b}{s.unit || ''}</span>
                    <span className="ms-lbl">{s.label}</span>
                  </div>
                )
              })}
            </div>

            <div className="match-events">
              <div className="me-head">Key events</div>
              {MATCH_EVENTS.slice().reverse().slice(0, 4).map((e, i) => (
                <div key={i} className={'me-row team-' + e.team}>
                  <span className="me-min">{e.min}′</span>
                  <EventBadge type={e.type} />
                  <span className="me-who">{e.who}</span>
                  {e.detail && <span className="me-detail">{e.detail}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Polymarket / Market card ───────────────────── */}
          <div className="room-card market">
            <div className="room-card-head">
              <h3>{t.market.platform.split(' ')[0]} market</h3>
              <a className="room-card-link" href={t.market.url} target="_blank" rel="noreferrer">Open ↗</a>
            </div>

            <div className="market-top">
              <div className="market-price">
                <div className="mp-current">{t.market.currentPrice}%</div>
                <div className={'mp-change ' + (t.market.edge > 0 ? 'up' : 'down')}>
                  {t.market.edge > 0 ? '▲' : '▼'} {Math.abs(t.market.edge)}pt vs AI
                </div>
              </div>
              <Sparkline data={PRICE_HISTORY} />
            </div>

            <div className="market-stats">
              <div className="market-stat">
                <div className="ms-lbl">AI consensus</div>
                <div className="ms-val ai">{t.market.aiConsensus}%</div>
              </div>
              <div className="market-stat">
                <div className="ms-lbl">24h vol</div>
                <div className="ms-val">{t.market.volume24h}</div>
              </div>
              <div className="market-stat">
                <div className="ms-lbl">YES depth</div>
                <div className="ms-val">$118k</div>
              </div>
              <div className="market-stat">
                <div className="ms-lbl">NO depth</div>
                <div className="ms-val">$74k</div>
              </div>
            </div>

            <div className="market-flow">
              <div className="mf-head">
                <span>Buy pressure (last hour)</span>
                <span className="mf-ratio">68/32</span>
              </div>
              <div className="mf-bar">
                <span className="mf-yes" style={{ width: '68%' }}>YES</span>
                <span className="mf-no" style={{ width: '32%' }}>NO</span>
              </div>
            </div>

            <div className="market-trades">
              <div className="mt-head">Recent trades</div>
              {RECENT_TRADES.map((tr, i) => (
                <div key={i} className="mt-row">
                  <span className={'mt-side ' + (tr.side === 'YES' ? 'yes' : 'no')}>{tr.side}</span>
                  <span className="mt-size">{tr.size}</span>
                  <span className="mt-trader">{tr.trader}</span>
                  <span className="mt-when">{tr.when}</span>
                </div>
              ))}
            </div>
          </div>


          <div className="room-card replies">
            <div className="room-card-head">
              <h3>Spectator replies</h3>
              <span className="room-card-sub">{t.spectatorCount} watching</span>
            </div>
            <div className="rep-stream">
              {replies.map((r, i) => (
                <div key={i} className="rep-msg">
                  <span className="rep-who">{r.who}</span>
                  <span className="rep-text">{r.text}</span>
                </div>
              ))}
            </div>
            <div className="rep-note">Spectator chat is read-only — fork the table to discuss privately.</div>
          </div>

        </aside>
      </div>
    </div>
  )
}
