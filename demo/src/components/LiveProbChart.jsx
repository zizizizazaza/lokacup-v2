import { useEffect, useRef, useState } from 'react'

// Match window we visualise (kickoff → now)
const MIN_START = 20
const MIN_NOW   = 67

// Predefined "true" event markers for the demo match
const EVENTS = [
  { min: 23, kind: 'goal',   team: 'a', label: 'Neymar', detail: '1-0' },
  { min: 41, kind: 'goal',   team: 'b', label: 'Hakimi', detail: '1-1' },
  { min: 58, kind: 'yellow', team: 'a', label: 'Casemiro' },
  { min: 62, kind: 'shot',   team: 'a', label: 'Vinícius' },
  { min: 67, kind: 'sub',    team: 'b', label: 'Ziyech' },
]

const AGENTS = [
  { key: 'stats',   name: 'Stats',   short: 'ST', tone: 'mint',  current: 72 },
  { key: 'odds',    name: 'Odds',    short: 'OD', tone: 'gold',  current: 64 },
  { key: 'news',    name: 'News',    short: 'NW', tone: 'coral', current: 56 },
  { key: 'tactics', name: 'Tactics', short: 'TA', tone: 'cyan',  current: 70 },
]

const TICKER_POOL = [
  { agent: 'Stats',   text: 'xG diff still favours BRA — 1.7 vs 1.1.' },
  { agent: 'Odds',    text: 'Whale just printed $42k YES on Polymarket.' },
  { agent: 'News',    text: 'Reuters: Neymar warming up, sub watch.' },
  { agent: 'Tactics', text: 'MAR dropped to back-five — sub incoming.' },
  { agent: 'Odds',    text: 'Bet365 implies 56% vs Poly 61% — 5pt edge.' },
  { agent: 'Stats',   text: 'ELO model: BRA 1934, MAR 1881.' },
  { agent: 'News',    text: 'Müller flagged: "tight hamstring" pre-match.' },
  { agent: 'Tactics', text: 'Casemiro 8/10 second-balls won.' },
]

// Generate a plausible probability history (BRA/MAR/Draw, each 0..100, sum=100)
function genHistory(seedEvents) {
  const pts = []
  let bra = 56, mar = 22, draw = 22
  for (let m = MIN_START; m <= MIN_NOW; m++) {
    // small drift
    bra += (Math.random() - 0.5) * 1.4
    mar += (Math.random() - 0.5) * 1.2
    draw += (Math.random() - 0.5) * 0.8
    // event jolts — search any event at this minute
    const ev = seedEvents.find((e) => e.min === m)
    if (ev) {
      if (ev.kind === 'goal' && ev.team === 'a') { bra += 8; mar -= 5; draw -= 3 }
      if (ev.kind === 'goal' && ev.team === 'b') { mar += 9; bra -= 6; draw -= 3 }
      if (ev.kind === 'shot') { bra += 2; mar -= 1; draw -= 1 }
      if (ev.kind === 'yellow') { /* small dip if team a */ if (ev.team === 'a') { bra -= 2; mar += 1; draw += 1 } }
      if (ev.kind === 'sub') { mar += 1.5; bra -= 0.5; draw -= 1 }
    }
    bra = Math.max(8, Math.min(82, bra))
    mar = Math.max(6, Math.min(72, mar))
    draw = Math.max(4, Math.min(34, draw))
    const s = bra + mar + draw
    pts.push({ m, bra: (bra / s) * 100, mar: (mar / s) * 100, draw: (draw / s) * 100 })
  }
  return pts
}

export default function LiveProbChart() {
  const [history, setHistory] = useState(() => genHistory(EVENTS))
  const [agents, setAgents] = useState(AGENTS)
  const [tickerIdx, setTickerIdx] = useState(0)
  const minuteRef = useRef(MIN_NOW)
  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: 900, h: 380 })
  const [hover, setHover] = useState(null)

  // Live tick — every ~1.6s push a new minute's data point and wiggle agents
  useEffect(() => {
    const id = setInterval(() => {
      minuteRef.current += 1
      const m = minuteRef.current
      setHistory((prev) => {
        const last = prev[prev.length - 1]
        let bra = last.bra + (Math.random() - 0.5) * 2.4
        let mar = last.mar + (Math.random() - 0.5) * 2.0
        let draw = last.draw + (Math.random() - 0.5) * 1.4
        bra = Math.max(8, Math.min(82, bra))
        mar = Math.max(6, Math.min(72, mar))
        draw = Math.max(4, Math.min(34, draw))
        const s = bra + mar + draw
        return [...prev.slice(-90), { m, bra: (bra / s) * 100, mar: (mar / s) * 100, draw: (draw / s) * 100 }]
      })
      setAgents((prev) => prev.map((a) => ({
        ...a,
        current: Math.max(20, Math.min(90, a.current + (Math.random() - 0.5) * 4))
      })))
    }, 1600)
    return () => clearInterval(id)
  }, [])

  // Rotating one-line ticker
  useEffect(() => {
    const id = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER_POOL.length), 3000)
    return () => clearInterval(id)
  }, [])

  // ResizeObserver for responsive chart
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.max(400, width), h: Math.max(240, height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const last = history[history.length - 1]
  const first = history[0]
  const lastM = history[history.length - 1].m
  const firstM = history[0].m

  // Compute chart geometry
  const padL = 36, padR = 92, padT = 18, padB = 32
  const innerW = size.w - padL - padR
  const innerH = size.h - padT - padB
  const xOf = (m) => padL + ((m - firstM) / Math.max(1, lastM - firstM)) * innerW
  const yOf = (v) => padT + innerH - (v / 100) * innerH

  // build polylines
  const lineBra  = history.map((p) => `${xOf(p.m)},${yOf(p.bra)}`).join(' ')
  const lineMar  = history.map((p) => `${xOf(p.m)},${yOf(p.mar)}`).join(' ')
  const lineDraw = history.map((p) => `${xOf(p.m)},${yOf(p.draw)}`).join(' ')

  const cur = TICKER_POOL[tickerIdx]
  const cmpFirst = (cur, base) => {
    const d = Math.round(cur - base)
    return { d, arr: d > 0 ? '▲' : d < 0 ? '▼' : '·' }
  }
  const braDelta  = cmpFirst(last.bra, first.bra)
  const marDelta  = cmpFirst(last.mar, first.mar)
  const drawDelta = cmpFirst(last.draw, first.draw)

  // Mouse → chart minute readout
  const onMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left
    if (px < padL || px > padL + innerW) { setHover(null); return }
    const m = Math.round(firstM + ((px - padL) / innerW) * (lastM - firstM))
    const p = history.find((q) => q.m === m) || history[history.length - 1]
    setHover({ m, p, x: xOf(p.m) })
  }
  const onLeave = () => setHover(null)

  return (
    <div className="lpc-card">
      <div className="lpc-head">
        <div className="lpc-title">
          <h3>AI win probability</h3>
          <span className="lpc-sub">Live · BRA vs MAR · {lastM}′</span>
        </div>
        <div className="lpc-summary">
          <div className={'lpc-sum-row bra' + (last.bra >= last.mar ? ' lead' : '')}>
            <span className="dot" />
            <span className="lbl">BRA</span>
            <span className="val">{Math.round(last.bra)}%</span>
            <span className={'delta ' + (braDelta.d > 0 ? 'up' : braDelta.d < 0 ? 'down' : 'flat')}>
              {braDelta.arr}{Math.abs(braDelta.d)}
            </span>
          </div>
          <div className="lpc-sum-row draw">
            <span className="dot" />
            <span className="lbl">Draw</span>
            <span className="val">{Math.round(last.draw)}%</span>
            <span className={'delta ' + (drawDelta.d > 0 ? 'up' : drawDelta.d < 0 ? 'down' : 'flat')}>
              {drawDelta.arr}{Math.abs(drawDelta.d)}
            </span>
          </div>
          <div className={'lpc-sum-row mar' + (last.mar > last.bra ? ' lead' : '')}>
            <span className="dot" />
            <span className="lbl">MAR</span>
            <span className="val">{Math.round(last.mar)}%</span>
            <span className={'delta ' + (marDelta.d > 0 ? 'up' : marDelta.d < 0 ? 'down' : 'flat')}>
              {marDelta.arr}{Math.abs(marDelta.d)}
            </span>
          </div>
        </div>
      </div>

      <div className="lpc-chart" ref={containerRef} onMouseMove={onMove} onMouseLeave={onLeave}>
        <svg viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none" className="lpc-svg">
          {/* horizontal gridlines */}
          {[25, 50, 75].map((g) => (
            <g key={g}>
              <line x1={padL} x2={padL + innerW} y1={yOf(g)} y2={yOf(g)} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 5" />
              <text x={padL - 8} y={yOf(g) + 3} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-data)">{g}%</text>
            </g>
          ))}

          {/* vertical time ticks every 10 mins */}
          {Array.from({ length: Math.floor((lastM - firstM) / 10) + 1 }).map((_, i) => {
            const m = firstM + i * 10
            if (m > lastM) return null
            return (
              <g key={m}>
                <line x1={xOf(m)} x2={xOf(m)} y1={padT} y2={padT + innerH} stroke="rgba(255,255,255,0.04)" />
                <text x={xOf(m)} y={padT + innerH + 14} fontSize="9" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontFamily="var(--font-data)">{m}′</text>
              </g>
            )
          })}

          {/* Event markers */}
          {EVENTS.map((e) => (
            <g key={e.min} className={'lpc-ev ' + e.kind}>
              <line x1={xOf(e.min)} x2={xOf(e.min)} y1={padT} y2={padT + innerH}
                    stroke={e.kind === 'goal' ? 'var(--accent-red)' : e.kind === 'yellow' ? '#facc15' : e.kind === 'sub' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)'}
                    strokeDasharray="3 3"
                    opacity="0.65" />
              <rect x={xOf(e.min) - 22} y={padT - 12} width="44" height="14" rx="3"
                    fill={e.kind === 'goal' ? 'var(--accent-red)' : e.kind === 'yellow' ? '#facc15' : e.kind === 'sub' ? 'var(--accent-blue)' : '#444'}
                    opacity="0.9" />
              <text x={xOf(e.min)} y={padT - 2} fontSize="8.5" textAnchor="middle" fill="#fff" fontFamily="var(--font-data)" fontWeight="700" letterSpacing="0.06em">
                {e.kind === 'goal' ? `GOAL ${e.detail}` : e.kind === 'yellow' ? 'YEL' : e.kind === 'sub' ? 'SUB' : 'SHOT'}
              </text>
            </g>
          ))}

          {/* shaded under BRA */}
          <polygon
            points={`${padL},${padT + innerH} ${lineBra} ${padL + innerW},${padT + innerH}`}
            fill="var(--accent-red)" opacity="0.06"
          />

          {/* lines */}
          <polyline points={lineDraw} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={lineMar}  fill="none" stroke="var(--accent-blue)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={lineBra}  fill="none" stroke="var(--accent-red)"  strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

          {/* end dots */}
          <circle cx={xOf(lastM)} cy={yOf(last.bra)}  r="4" fill="var(--accent-red)" stroke="#000" strokeWidth="1" />
          <circle cx={xOf(lastM)} cy={yOf(last.mar)}  r="3.5" fill="var(--accent-blue)" stroke="#000" strokeWidth="1" />
          <circle cx={xOf(lastM)} cy={yOf(last.draw)} r="3" fill="rgba(255,255,255,0.7)" stroke="#000" strokeWidth="1" />

          {/* hover crosshair */}
          {hover && (
            <g>
              <line x1={hover.x} x2={hover.x} y1={padT} y2={padT + innerH} stroke="rgba(255,255,255,0.25)" strokeDasharray="2 3" />
              <circle cx={hover.x} cy={yOf(hover.p.bra)}  r="3" fill="var(--accent-red)" />
              <circle cx={hover.x} cy={yOf(hover.p.mar)}  r="3" fill="var(--accent-blue)" />
              <circle cx={hover.x} cy={yOf(hover.p.draw)} r="3" fill="#fff" />
            </g>
          )}
        </svg>

        {/* Agent heads floating at their current probability on the right edge */}
        <div className="lpc-agents" style={{ right: 8 }}>
          {agents.map((a) => (
            <div
              key={a.key}
              className={'lpc-agent tone-' + a.tone}
              style={{ top: yOf(a.current) - 18 + 'px' }}
              title={`${a.name} — ${Math.round(a.current)}%`}
            >
              <span className="lpc-agent-bot">
                <span className="lpc-eye left" />
                <span className="lpc-eye right" />
              </span>
              <span className="lpc-agent-tip">
                {a.name} <b>{Math.round(a.current)}%</b>
              </span>
            </div>
          ))}
        </div>

        {hover && (
          <div className="lpc-hover-box" style={{ left: hover.x + 8 + 'px', top: padT + 6 + 'px' }}>
            <div className="lhb-min">{hover.m}′</div>
            <div className="lhb-row"><span className="dot bra" />BRA <b>{Math.round(hover.p.bra)}%</b></div>
            <div className="lhb-row"><span className="dot draw" />Draw <b>{Math.round(hover.p.draw)}%</b></div>
            <div className="lhb-row"><span className="dot mar" />MAR <b>{Math.round(hover.p.mar)}%</b></div>
          </div>
        )}
      </div>

      <div className="lpc-foot">
        <div className="lpc-ticker">
          <span className="lpc-ticker-min">{lastM}′</span>
          <span className={'lpc-ticker-agent tone-' +
            (cur.agent === 'Stats' ? 'mint' :
             cur.agent === 'Odds' ? 'gold' :
             cur.agent === 'News' ? 'coral' : 'cyan')}>{cur.agent}</span>
          <span className="lpc-ticker-text" key={tickerIdx}>{cur.text}</span>
        </div>
        <div className="lpc-status">
          <span className="lpc-status-dot" />
          4 agents · last call <b>{(Date.now() % 30 + 4)|0}s</b> ago
        </div>
      </div>
    </div>
  )
}
