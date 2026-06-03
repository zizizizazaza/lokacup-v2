import { useEffect, useRef, useState } from 'react'
import { IconVolumeOn, IconVolumeOff } from './Icons.jsx'
import { acquireVoice, hasVoiceLock } from '../lib/voiceLock.js'

const AGENTS = {
  stats:   { name: 'Stats Analyst',   tone: 'mint',  desc: 'FBref · xG · H2H · ELO' },
  odds:    { name: 'Market Analyst',  tone: 'gold',  desc: 'Polymarket · Bet365 · whales' },
  news:    { name: 'News Analyst',    tone: 'coral', desc: 'Lineups · injuries · social' },
  tactics: { name: 'Tactics Analyst', tone: 'cyan',  desc: 'Formations · matchups' },
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
  const [voiceOn, setVoiceOn] = useState(true) // Coach Mike is on by default
  const [tab, setTab] = useState('presenter') // 'feed' | 'presenter' — Coach Mike open by default
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
  const voiceLockRef = useRef(null)
  // Acquire the global voice lock once at mount; release on unmount.
  if (voiceLockRef.current === null) voiceLockRef.current = acquireVoice()
  useEffect(() => () => voiceLockRef.current?.release(), [])
  // voiceOnRef is synced synchronously below — see "Sync voiceOnRef IMMEDIATELY".

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
    // Only the lock holder may speak — silences any duplicate instances.
    if (!hasVoiceLock(voiceLockRef.current?.id)) return
    // Always clear the queue before speaking — otherwise rapid back-to-back lines
    // pile up and overlap (causes the "two people talking" effect).
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) u.voice = v
    u.rate = 1.05
    u.pitch = 0.95
    u.volume = 1
    u.onstart = () => { if (voiceOnRef.current) setSpeaking(true) }
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
      setCurrentLine({ agent: pick.agent, name: AGENTS[pick.agent].name, text: pick.text })
      speak(`${AGENTS[pick.agent].name}. ${pick.text}`)
    }, 3200)
    return () => clearInterval(id)
  }, [eventIdx])

  // Sync voiceOnRef IMMEDIATELY (don't wait for the next render-after effect).
  // Without this, the interval that fires between mute click and ref update can still speak().
  voiceOnRef.current = voiceOn

  useEffect(() => {
    if (voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return
    const ss = window.speechSynthesis
    // 1. Replace ss.speak with a no-op while muted. NOTHING can queue audio, period —
    //    no matter how aggressive the streaming interval gets.
    const origSpeak = ss.speak.bind(ss)
    ss.speak = () => {}
    // 2. Pause + cancel, repeatedly, to kill anything mid-utterance.
    //    Chrome/Safari ignore cancel() inconsistently when an utterance has just started.
    const kill = () => { try { ss.pause() } catch (e) {} ; ss.cancel() }
    kill()
    setSpeaking(false)
    const ids = [50, 150, 350, 700, 1200].map((d) => setTimeout(kill, d))
    return () => {
      ids.forEach(clearTimeout)
      ss.speak = origSpeak
      try { ss.resume() } catch (e) {}
    }
  }, [voiceOn])

  const toggleVoice = () => {
    setVoiceOn((on) => {
      const next = !on
      // No confirmation utterance — just flip the switch. The next streaming line plays naturally.
      if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
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
          Live Analysis
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
          {/* Mac-style microphone — no avatar character */}
          <div className={'presenter-mic' + (voiceOn ? ' is-live' : '')}>
            <svg viewBox="0 0 64 80" width="56" height="70" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {/* Capsule */}
              <rect x="22" y="6" width="20" height="36" rx="10" />
              {/* Grille lines */}
              <line x1="26" y1="14" x2="38" y2="14" />
              <line x1="26" y1="20" x2="38" y2="20" />
              <line x1="26" y1="26" x2="38" y2="26" />
              <line x1="26" y1="32" x2="38" y2="32" />
              {/* Arc */}
              <path d="M14 36a18 18 0 0 0 36 0" />
              {/* Stem */}
              <line x1="32" y1="54" x2="32" y2="66" />
              {/* Base */}
              <line x1="22" y1="66" x2="42" y2="66" />
            </svg>
            {voiceOn && <span className="presenter-mic-ring" aria-hidden />}
          </div>

          <div className="presenter-identity">
            <span className="presenter-identity-name">Coach Mike</span>
            <span className="presenter-identity-role">AI presenter</span>
          </div>

          <div className="presenter-on-air">
            <span className={'on-air-dot' + (voiceOn ? ' live' : '')} />
            {voiceOn ? (speaking ? 'Live · commentating now' : 'Live · waiting for the next call') : 'Muted'}
          </div>

          <button
            className={'presenter-btn' + (voiceOn ? ' on' : '')}
            onClick={toggleVoice}
            aria-pressed={voiceOn}
            title={voiceOn ? 'Mute Coach Mike' : 'Unmute Coach Mike'}
          >
            {voiceOn ? <IconVolumeOn width={16} height={16} /> : <IconVolumeOff width={16} height={16} />}
            <span>{voiceOn ? 'Mute' : 'Unmute'}</span>
            {voiceOn && <span className="voice-wave"><i /><i /><i /></span>}
          </button>
        </div>
      )}
    </div>
  )
}
