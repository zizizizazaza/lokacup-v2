import { useEffect, useRef, useState } from 'react'
import { IconVolumeOn, IconVolumeOff } from './Icons.jsx'

const AGENTS = {
  stats:   { name: 'Stats',   tone: 'mint',  desc: 'FBref · xG · H2H · ELO' },
  odds:    { name: 'Odds',    tone: 'gold',  desc: 'Polymarket · Bet365 · whales' },
  news:    { name: 'News',    tone: 'coral', desc: 'Lineups · injuries · social' },
  tactics: { name: 'Tactics', tone: 'cyan',  desc: 'Formations · matchups' },
}

const POOL = [
  { agent: 'stats',   text: 'xG diff after 60′: BRA 1.7 vs DEU 1.1. Brazil pressing the central channels.' },
  { agent: 'odds',    text: 'Polymarket BRA win drifted 58 → 61% after the 62′ chance. Whale just printed $42k Yes.' },
  { agent: 'news',    text: 'Reuters: Neymar warming up. Lineup leak suggests he comes on at 70′.' },
  { agent: 'tactics', text: 'DEU dropped to a back-five. Wirtz isolated — expect a sub within 8 minutes.' },
  { agent: 'stats',   text: 'H2H in WC knockouts: BRA wins 4/6 over last 20y, avg 1.8 goals per game.' },
  { agent: 'odds',    text: 'Bet365 implies 56% BRA vs Polymarket 61% — 5pt edge widening on BRA Yes.' },
  { agent: 'news',    text: 'Müller flagged in pre-match: "tight hamstring". Watch for an early withdrawal.' },
  { agent: 'tactics', text: 'Casemiro shielding the back four is killing DEU\'s second balls. 8/10 won.' },
  { agent: 'stats',   text: 'ELO model now: BRA 1934, DEU 1881. Updated post-87′ build-up.' },
  { agent: 'odds',    text: 'Order book on BRA tightens — top of book down to 0.8c spread on Polymarket.' },
  { agent: 'news',    text: 'Lineup tweet from @CBF_Futebol confirms Vinícius starts on the left.' },
  { agent: 'tactics', text: 'Pressing trigger: DEU\'s right-back. BRA targets the channel each time he steps.' },
]

const EVENTS = [
  { min: 62, kind: 'chance', text: 'Vinícius hits the post — BRA pushing.' },
  { min: 67, kind: 'goal',   text: 'GOAL · Müller 1-1. DEU equalizes from a corner.' },
  { min: 72, kind: 'card',   text: 'Yellow · Casemiro. Already on a booking from G2.' },
]

function fmtMin(m) { return `${m}′` }

// Polymarket-style multi-series probability chart
function ProbChart({ history }) {
  const w = 320, h = 120, pl = 28, pr = 56, pt = 6, pb = 6
  const innerW = w - pl - pr, innerH = h - pt - pb
  const max = 75, min = 0 // y-axis range %
  const step = innerW / Math.max(1, history.length - 1)
  const series = [
    { key: 'bra',  color: 'var(--accent-green)', label: 'Brazil',  flag: 'br' },
    { key: 'ger',  color: 'var(--accent-red)',   label: 'Germany', flag: 'de' },
    { key: 'draw', color: 'var(--fg-dim)',       label: 'Draw' },
  ]
  const lines = series.map((s) => {
    const pts = history.map((p, i) => {
      const x = pl + i * step
      const v = Math.max(min, Math.min(max, p[s.key]))
      const y = pt + innerH - ((v - min) / (max - min)) * innerH
      return [x, y]
    })
    return { ...s, pts, last: history[history.length - 1][s.key] }
  })
  const last = history[history.length - 1]
  const gridYs = [25, 50, 75]
  return (
    <div className="prob-chart">
      <div className="prob-chart-head">
        <span>AI win probability</span>
        <span className="prob-chart-sub">Live · last 45s</span>
      </div>
      <div className="prob-chart-body">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="prob-chart-svg">
          {/* y-axis gridlines */}
          {gridYs.map((g) => {
            const y = pt + innerH - ((g - min) / (max - min)) * innerH
            return (
              <g key={g}>
                <line x1={pl} y1={y} x2={w - pr} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
                <text x={pl - 6} y={y + 3} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.35)" fontFamily="var(--font-data)">{g}%</text>
              </g>
            )
          })}
          {/* polyline for each series */}
          {lines.map((s) => (
            <g key={s.key}>
              <polyline
                points={s.pts.map((p) => p.join(',')).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.9"
              />
              {/* end dot */}
              <circle cx={s.pts[s.pts.length - 1][0]} cy={s.pts[s.pts.length - 1][1]} r="3" fill={s.color} />
            </g>
          ))}
          {/* right-edge value labels */}
          {lines.map((s, i) => {
            const last = s.pts[s.pts.length - 1]
            // spread labels vertically so they don't overlap
            const yLabel = Math.max(pt + 8, Math.min(pt + innerH - 4, last[1]))
            return (
              <text
                key={s.key + '-l'}
                x={w - pr + 6}
                y={yLabel + 3}
                fontSize="10"
                fill={s.color}
                fontFamily="var(--font-data)"
                fontWeight="700"
              >
                {Math.round(s.last)}%
              </text>
            )
          })}
        </svg>
      </div>
      <div className="prob-chart-legend">
        {series.map((s) => (
          <div key={s.key} className={'pcl-item ' + s.key}>
            {s.flag && <img className="flag" alt="" src={`https://flagcdn.com/w20/${s.flag}.png`} />}
            <span className="pcl-name">{s.label}</span>
            <span className="pcl-val">{Math.round(last[s.key])}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Animated AI presenter face — mouth opens/closes when speaking
function AvatarFace({ speaking, agentTone }) {
  return (
    <div className={'av-face' + (speaking ? ' speaking' : '') + (agentTone ? ' tone-' + agentTone : '')}>
      <div className="av-bg-glow" />
      <div className="av-head">
        <div className="av-screen">
          <div className="av-eye left" />
          <div className="av-eye right" />
          <div className="av-mouth" />
        </div>
        <div className="av-antenna" />
      </div>
      <div className="av-shoulders" />
    </div>
  )
}

export default function LiveAI() {
  const [feed, setFeed] = useState(() => POOL.slice(0, 4).map((p, i) => ({ ...p, id: i, t: fmtMin(58 + i) })))
  const [eventIdx, setEventIdx] = useState(0)
  const [voiceOn, setVoiceOn] = useState(false)
  const [tab, setTab] = useState('feed') // 'feed' | 'presenter'
  const [currentLine, setCurrentLine] = useState(null) // { agent, text } currently being presented
  const [speaking, setSpeaking] = useState(false)

  // Live probability history — Polymarket-style line chart
  const SERIES = 50
  const [probHistory, setProbHistory] = useState(() => {
    const seed = []
    let bra = 58, ger = 27, draw = 15
    for (let i = 0; i < SERIES; i++) {
      bra  += (Math.random() - 0.5) * 1.6
      ger  += (Math.random() - 0.5) * 1.4
      draw += (Math.random() - 0.5) * 0.9
      // re-normalize to 100
      const s = bra + ger + draw
      seed.push({ bra: (bra / s) * 100, ger: (ger / s) * 100, draw: (draw / s) * 100 })
    }
    return seed
  })

  // Probability ticker — push a new point every ~900ms
  useEffect(() => {
    const id = setInterval(() => {
      setProbHistory((prev) => {
        const last = prev[prev.length - 1]
        let bra  = last.bra  + (Math.random() - 0.5) * 2.4
        let ger  = last.ger  + (Math.random() - 0.5) * 2.2
        let draw = last.draw + (Math.random() - 0.5) * 1.4
        // clamp + normalize
        bra  = Math.max(8, Math.min(82, bra))
        ger  = Math.max(8, Math.min(82, ger))
        draw = Math.max(4, Math.min(40, draw))
        const s = bra + ger + draw
        const next = { bra: (bra / s) * 100, ger: (ger / s) * 100, draw: (draw / s) * 100 }
        return [...prev.slice(-(SERIES - 1)), next]
      })
    }, 900)
    return () => clearInterval(id)
  }, [])

  const counter = useRef(feed.length)
  const minute = useRef(62)
  const voiceOnRef = useRef(voiceOn)
  const voiceCacheRef = useRef(null)
  useEffect(() => { voiceOnRef.current = voiceOn }, [voiceOn])

  const pickVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null
    if (voiceCacheRef.current) return voiceCacheRef.current
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find((v) => /en-(US|GB)/.test(v.lang) && /Daniel|Samantha|Google US|Microsoft|Alex/i.test(v.name))
      || voices.find((v) => v.lang && v.lang.startsWith('en'))
      || voices[0]
    voiceCacheRef.current = preferred
    return preferred
  }
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = pickVoice
      pickVoice()
    }
    return () => { if (window.speechSynthesis) window.speechSynthesis.cancel() }
  }, [])

  const speak = (text) => {
    if (!voiceOnRef.current || typeof window === 'undefined' || !window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) u.voice = v
    u.rate = 1.05
    u.pitch = 0.95
    u.volume = 1
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  useEffect(() => {
    const id = setInterval(() => {
      counter.current += 1
      minute.current += 1

      if (counter.current % 4 === 0 && eventIdx < EVENTS.length) {
        const ev = EVENTS[eventIdx]
        setFeed((prev) => [...prev.slice(-30), { id: counter.current, kind: 'event', event: ev, t: fmtMin(ev.min) }])
        setEventIdx((i) => i + 1)
        setCurrentLine({ agent: 'event', name: ev.kind === 'goal' ? 'Goal!' : ev.kind === 'card' ? 'Booking' : 'Chance', text: ev.text })
        speak(ev.text)
        return
      }

      const pick = POOL[counter.current % POOL.length]
      setFeed((prev) => [...prev.slice(-30), { id: counter.current, ...pick, t: fmtMin(minute.current) }])
      setCurrentLine({ agent: pick.agent, name: AGENTS[pick.agent].name + ' Agent', text: pick.text })
      speak(`${AGENTS[pick.agent].name} agent. ${pick.text}`)
    }, 3200)
    return () => clearInterval(id)
  }, [eventIdx])

  useEffect(() => {
    if (!voiceOn && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [voiceOn])

  const toggleVoice = () => {
    setVoiceOn((on) => {
      const next = !on
      if (next && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance('Live AI commentary on.')
        const v = pickVoice()
        if (v) u.voice = v
        u.rate = 1.05
        u.onstart = () => setSpeaking(true)
        u.onend = () => setSpeaking(false)
        window.speechSynthesis.speak(u)
      }
      return next
    })
  }

  const streamRef = useRef(null)
  useEffect(() => {
    const el = streamRef.current
    if (el && tab === 'feed') el.scrollTop = el.scrollHeight
  }, [feed, tab])

  const lineTone = currentLine && AGENTS[currentLine.agent] ? AGENTS[currentLine.agent].tone : null

  return (
    <div className="live-ai">
      <div className="live-ai-head">
        <div className="live-match-row">
          <div className="live-match-teams">
            <span className="team">
              <img className="flag" alt="" src="https://flagcdn.com/w40/de.png" />
              DEU
            </span>
            <span className="score">1 — 1</span>
            <span className="team">
              BRA
              <img className="flag" alt="" src="https://flagcdn.com/w40/br.png" />
            </span>
          </div>
          <div className="live-match-meta">
            <span className="live-dot" /> Live · {fmtMin(minute.current)}
          </div>
        </div>
        <ProbChart history={probHistory} />
      </div>

      <div className="live-tabs">
        <button
          className={'live-tab' + (tab === 'feed' ? ' active' : '')}
          onClick={() => setTab('feed')}
        >
          Live feed
        </button>
        <button
          className={'live-tab' + (tab === 'presenter' ? ' active' : '')}
          onClick={() => setTab('presenter')}
        >
          AI Presenter
        </button>
      </div>

      {tab === 'feed' ? (
        <>
          <div className="live-ai-agents">
            {Object.entries(AGENTS).map(([k, a]) => (
              <div key={k} className={'agent-chip tone-' + a.tone} title={a.desc}>
                <span className="agent-dot" />
                <span>{a.name}</span>
              </div>
            ))}
          </div>

          <div className="live-ai-stream" ref={streamRef}>
            {feed.map((m) => m.kind === 'event' ? (
              <div key={m.id} className={'feed-event ' + m.event.kind}>
                <span className="ev-min">{m.t}</span>
                <span className="ev-text">{m.event.text}</span>
              </div>
            ) : (
              <div key={m.id} className={'feed-msg tone-' + AGENTS[m.agent].tone}>
                <div className="feed-msg-head">
                  <span className="feed-agent">{AGENTS[m.agent].name}</span>
                  <span className="feed-min">{m.t}</span>
                </div>
                <div className="feed-text">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="live-ai-foot">
            <span className="typing"><i /><i /><i /></span>
            <span>4 agents analyzing in parallel</span>
          </div>
        </>
      ) : (
        <div className="presenter">
          <AvatarFace speaking={speaking && voiceOn} agentTone={lineTone} />

          <div className="presenter-on-air">
            <span className={'on-air-dot' + (voiceOn ? ' live' : '')} />
            {voiceOn ? (speaking ? 'On air · commentating live' : 'On air · waiting for the next call') : 'Off air — tap to start'}
          </div>

          <button
            className={'presenter-btn' + (voiceOn ? ' on' : '')}
            onClick={toggleVoice}
            aria-pressed={voiceOn}
          >
            {voiceOn ? <IconVolumeOn width={16} height={16} /> : <IconVolumeOff width={16} height={16} />}
            <span>{voiceOn ? 'Mute presenter' : 'Start live commentary'}</span>
            {voiceOn && <span className="voice-wave"><i /><i /><i /></span>}
          </button>
        </div>
      )}
    </div>
  )
}
