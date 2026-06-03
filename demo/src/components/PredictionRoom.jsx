import { useEffect, useMemo, useRef, useState } from 'react'
import { acquireVoice, hasVoiceLock } from '../lib/voiceLock.js'

const AGENT_TONE = { 'Stats Analyst': 'mint', 'Market Analyst': 'gold', 'News Analyst': 'coral', 'Tactics Analyst': 'cyan' }

// Lines the AI presenter cycles through while live. Spoken via the Web Speech API when unmuted.
const PRESENTER_LINES = [
  "Welcome back to LokaCup. We're at 67 minutes — Brazil leading 2–1 against Field.",
  "Stats agent says expected goals favor Brazil by point six. The press is still on.",
  "Casemiro just picked up a yellow card. Subs watch is on — that could shift our model.",
  "Market consensus on Polymarket still lagging the AI read by three points.",
  "Latest debate round closed at 73 percent Brazil. Let's see how the next event moves it.",
]

function PresenterBar() {
  const [muted, setMuted] = useState(false) // default unmuted — narrator is talking on entry
  const [line, setLine] = useState(PRESENTER_LINES[0])
  const idx = useRef(0)
  const mutedRef = useRef(muted)
  mutedRef.current = muted // synchronous sync — interval callbacks see the latest mute state instantly
  const supportsTTS = typeof window !== 'undefined' && 'speechSynthesis' in window
  const voiceLockRef = useRef(null)
  if (voiceLockRef.current === null) voiceLockRef.current = acquireVoice()
  useEffect(() => () => voiceLockRef.current?.release(), [])

  // Rotate spoken lines every ~12s while unmuted.
  useEffect(() => {
    if (!supportsTTS) return
    if (muted) {
      const ss = window.speechSynthesis
      // Monkey-patch speak to a no-op so nothing can queue while muted.
      const origSpeak = ss.speak.bind(ss)
      ss.speak = () => {}
      // Hammer cancel for 1.2s to kill anything mid-utterance.
      const kill = () => { try { ss.pause() } catch (e) {} ; ss.cancel() }
      kill()
      const ids = [50, 150, 350, 700, 1200].map((d) => setTimeout(kill, d))
      return () => {
        ids.forEach(clearTimeout)
        ss.speak = origSpeak
        try { ss.resume() } catch (e) {}
      }
    }
    let alive = true
    const speak = (text) => {
      if (!alive || mutedRef.current) return
      // Only the lock holder speaks — kills any phantom duplicate instance.
      if (!hasVoiceLock(voiceLockRef.current?.id)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 1.05
      u.pitch = 1.0
      window.speechSynthesis.speak(u)
    }
    speak(line)
    const id = setInterval(() => {
      if (mutedRef.current) return
      idx.current = (idx.current + 1) % PRESENTER_LINES.length
      const next = PRESENTER_LINES[idx.current]
      setLine(next)
      speak(next)
    }, 12000)
    return () => {
      alive = false
      clearInterval(id)
      window.speechSynthesis.cancel()
    }
  }, [muted])

  // Cleanup on unmount: stop any speech, twice for good measure.
  useEffect(() => () => {
    if (supportsTTS) {
      window.speechSynthesis.cancel()
      setTimeout(() => window.speechSynthesis.cancel(), 60)
    }
  }, [])

  return (
    <div className={'pr-presenter' + (muted ? ' is-muted' : ' is-live')}>
      <div className="pr-presenter-avatar" aria-hidden>
        <span className="pr-presenter-glyph">🎙</span>
        {!muted && <span className="pr-presenter-ring" />}
      </div>
      <div className="pr-presenter-body">
        <div className="pr-presenter-meta">
          <span className="pr-presenter-name">coachMike</span>
          <span className="pr-presenter-role">· AI presenter</span>
          {!muted && (
            <span className="pr-presenter-wave" aria-hidden>
              <i /><i /><i /><i /><i />
            </span>
          )}
        </div>
        <div className="pr-presenter-line">{muted ? 'Muted — tap to unmute' : line}</div>
      </div>
      <button
        type="button"
        className="pr-presenter-mute"
        onClick={() => setMuted((v) => !v)}
        aria-label={muted ? 'Unmute presenter' : 'Mute presenter'}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        )}
      </button>
    </div>
  )
}

// Match kickoff wall clock — used to convert match minutes → "21:07" style timestamps.
const KICKOFF_HOURS = 20

// Convert match minute → "HH:MM" wall clock. We ignore halftime break for simplicity.
function wallClock(min) {
  const h = KICKOFF_HOURS + Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Predefined "predictions" the host opened for this match.
// Each has its own consensus state + chat thread.
const INITIAL_PREDICTIONS = [
  {
    id: 'winner',
    title: 'Who wins this match?',
    askedAt: 67,
    window: 'full match',
    primary: { label: 'BRA',    val: 71 },
    secondary:{ label: 'MAR',    val: 20 },
    third:    { label: 'Draw',   val: 9 },
    deltaPrim: +5,
    deltaPrimMin: 67,
    comments: 142,
    forks: 12,
    consensus: 'BRA',
    thread: [
      { ts: '62′', agent: 'Stats Analyst',   text: 'xG diff after 60′: BRA 1.7 vs MAR 1.1. Pressure cooking centrally.' },
      { ts: '63′', agent: 'Market Analyst',    text: 'Polymarket BRA drifted 58 → 64 after the chance. Whale printed $42k YES.' },
      { ts: '63′', agent: 'host',    text: 'Does Casemiro yellow change anything here?' },
      { ts: '63′', agent: 'News Analyst',    text: 'Books factored it in pre-match. Marginal — keeping BRA at 70.' },
      { ts: '64′', agent: 'Tactics Analyst', text: 'MAR dropped to back-five — Wirtz isolated. Sub watch within 8 min.' },
      { ts: '67′', agent: 'Stats Analyst',   text: 'Confidence step-up. BRA 71%, +5pt edge vs market 64%.' },
    ],
  },
  {
    id: 'next-goal',
    title: 'Which team scores the next goal?',
    askedAt: 60,
    window: 'next 10 min',
    primary: { label: 'BRA',  val: 64 },
    secondary:{ label: 'MAR',  val: 25 },
    third:    { label: 'None', val: 11 },
    deltaPrim: +7,
    deltaPrimMin: 67,
    comments: 38,
    forks: 4,
    consensus: 'BRA',
    thread: [
      { ts: '64′', agent: 'Tactics Analyst', text: 'BRA press wins climbing — 8/10 second balls last 5 min.' },
      { ts: '65′', agent: 'host',    text: 'What about subs cooling them off?' },
      { ts: '66′', agent: 'News Analyst',    text: 'No BRA sub announced; MAR brought Ziyech on (fresh legs).' },
      { ts: '67′', agent: 'Market Analyst',    text: 'BRA next-goal odds tightened 0.8c on Polymarket.' },
    ],
  },
  {
    id: 'final',
    title: 'What will the final score be?',
    askedAt: 55,
    window: 'full time',
    primary: { label: '2-1 BRA', val: 28 },
    secondary:{ label: '3-1 BRA', val: 18 },
    third:    { label: '2-2',     val: 14 },
    deltaPrim: -2,
    deltaPrimMin: 67,
    comments: 12,
    forks: 1,
    consensus: '2-1 BRA',
    thread: [
      { ts: '60′', agent: 'Stats Analyst', text: 'Most likely terminal score now 2-1 BRA at 28%.' },
      { ts: '64′', agent: 'Stats Analyst', text: 'Stoppage risk inflating 2-2 — up 3pt.' },
    ],
  },
  {
    id: 'over25',
    title: 'Will total goals go over 2.5?',
    askedAt: 25,
    window: 'full time',
    primary: { label: 'Over',  val: 62 },
    secondary:{ label: 'Under', val: 38 },
    deltaPrim: +6,
    deltaPrimMin: 41,
    comments: 24,
    forks: 2,
    consensus: 'Over',
    thread: [
      { ts: '23′', agent: 'Market Analyst',  text: 'Goal at 23 — Over 2.5 immediately moves to 51%.' },
      { ts: '41′', agent: 'Market Analyst',  text: 'Second goal — Over jumps to 62%.' },
      { ts: '62′', agent: 'News Analyst',  text: 'Pace holding; ref letting plenty go. Over still favoured.' },
    ],
  },
  {
    id: 'halftime',
    title: 'Who led at half-time?',
    askedAt: 38,
    window: 'at 45′',
    primary: { label: 'BRA',  val: 0 },
    secondary:{ label: 'MAR',  val: 0 },
    third:    { label: 'Tied', val: 100 },
    deltaPrim: 0,
    deltaPrimMin: 45,
    comments: 5,
    forks: 0,
    consensus: 'Tied — RESOLVED',
    resolved: true,
    thread: [
      { ts: '23′', agent: 'Stats Analyst', text: 'After Neymar goal, BRA HT leader 78%.' },
      { ts: '41′', agent: 'News Analyst',  text: 'Hakimi equalises — flipping to Tied probable.' },
      { ts: '45′', agent: 'Stats Analyst', text: 'Resolved: Tied 1-1 at half-time.' },
    ],
  },
  {
    id: 'cards',
    title: 'Will there be 5 or more bookings?',
    askedAt: 50,
    window: 'full time',
    primary: { label: '≥5',  val: 71 },
    secondary:{ label: '<5',  val: 29 },
    deltaPrim: +9,
    deltaPrimMin: 58,
    comments: 8,
    forks: 1,
    consensus: '≥5 cards',
    thread: [
      { ts: '58′', agent: 'News Analyst',    text: 'Ref is card-heavy historically — 4.3 avg per match.' },
      { ts: '58′', agent: 'Tactics Analyst', text: 'Casemiro on a yellow — high risk of 2nd.' },
    ],
  },
]

// Pool of "live" agent updates that the system streams into whichever prediction is selected
const STREAM_LINES = {
  winner: [
    { agent: 'Stats Analyst',   text: 'Re-running on 67′ event: BRA 73%, +2pt.' },
    { agent: 'Market Analyst',    text: 'Top-of-book on BRA YES tightening — book agrees.' },
    { agent: 'News Analyst',    text: 'Vinícius warming up corner — keep BRA boost.' },
    { agent: 'Tactics Analyst', text: 'Casemiro 2nd-balls won 9/10 — pressure mounting.' },
  ],
  'next-goal': [
    { agent: 'Tactics Analyst', text: 'BRA shot map skewing toward MAR right-back side.' },
    { agent: 'Market Analyst',    text: 'BRA next-goal NO drifting — sharps bought up.' },
    { agent: 'News Analyst',    text: 'MAR sub fresh; pressing may ease slightly.' },
  ],
  final: [
    { agent: 'Stats Analyst', text: 'Score sim: 2-1 28%, 3-1 18%, 2-2 14%.' },
    { agent: 'Stats Analyst', text: 'Updated terminal: 2-1 28% remains favourite.' },
  ],
  over25: [
    { agent: 'Market Analyst',  text: 'Over 2.5 still 62%. Two more shots in box add pressure.' },
    { agent: 'News Analyst',  text: 'Stoppage-time risk creeping.' },
  ],
  cards: [
    { agent: 'News Analyst',    text: 'Yellow shown to Casemiro at 58′ — count rising.' },
    { agent: 'Tactics Analyst', text: 'Frustration tackle pattern — 2 more likely.' },
  ],
}

function PredictionStripCard({ p, active, onClick }) {
  const tone = p.id === 'winner' ? 'mint' : p.id === 'next-goal' ? 'gold' : p.id === 'over25' ? 'coral' : p.id === 'cards' ? 'cyan' : 'mint'
  return (
    <button className={'ps-card' + (active ? ' active' : '') + (p.resolved ? ' resolved' : '')} onClick={onClick}>
      <div className="ps-head">
        <span className="ps-title">{p.title}</span>
        <span className="ps-window">{p.window}</span>
      </div>
      <div className="ps-primary">
        <span className="ps-label">{p.primary.label}</span>
        <span className={'ps-val tone-' + tone}>{p.primary.val}%</span>
        {p.deltaPrim !== 0 && !p.resolved && (
          <span className={'ps-delta ' + (p.deltaPrim > 0 ? 'up' : 'down')}>
            {p.deltaPrim > 0 ? '▲' : '▼'}{Math.abs(p.deltaPrim)} @{p.deltaPrimMin}′
          </span>
        )}
        {p.resolved && <span className="ps-resolved">resolved</span>}
      </div>
      <div className="ps-stats">
        <span>💬 {p.comments}</span>
        <span>↻ {p.forks}</span>
      </div>
      {active && <span className="ps-active-bar" />}
    </button>
  )
}

function fmtMin(m) { return `${m}′` }

export default function PredictionRoom() {
  const [predictions, setPredictions] = useState(INITIAL_PREDICTIONS)
  const [selectedId, setSelectedId] = useState('winner')
  const [input, setInput] = useState('')
  const minute = useRef(67)
  const streamRef = useRef(null)

  // Live stream: every ~3.5s, push a new agent line into one of the predictions
  useEffect(() => {
    const id = setInterval(() => {
      minute.current += 1
      const keys = Object.keys(STREAM_LINES)
      const pid = keys[Math.floor(Math.random() * keys.length)]
      const pool = STREAM_LINES[pid]
      const line = pool[Math.floor(Math.random() * pool.length)]
      setPredictions((prev) => prev.map((p) => {
        if (p.id !== pid) return p
        // Append to thread + nudge the primary by a small random amount
        const drift = (Math.random() - 0.5) * 6
        let primVal = Math.max(2, Math.min(96, p.primary.val + drift))
        return {
          ...p,
          primary: { ...p.primary, val: Math.round(primVal) },
          deltaPrim: Math.round(drift),
          deltaPrimMin: minute.current,
          comments: p.comments + (Math.random() < 0.4 ? 1 : 0),
          thread: [...p.thread.slice(-30), {
            ts: fmtMin(minute.current),
            agent: line.agent,
            text: line.text,
          }],
        }
      }))
    }, 3500)
    return () => clearInterval(id)
  }, [])

  // Sort newest → oldest; the newest is the "currently asked" question
  const timeline = predictions.slice().sort((a, b) => b.askedAt - a.askedAt)
  const currentId = timeline[0]?.id
  const selected = predictions.find((p) => p.id === selectedId) || timeline[0]
  const isViewingHistory = selected.id !== currentId

  // One merged chronological thread: each prediction emits a "tip" anchor
  // at its askedAt, followed by its discussion messages. Older predictions
  // appear above, newer (current) appears at the bottom.
  const flatThread = useMemo(() => {
    const out = []
    predictions
      .slice()
      .sort((a, b) => a.askedAt - b.askedAt)
      .forEach((p) => {
        out.push({
          kind: 'tip',
          id: 'tip-' + p.id,
          predictionId: p.id,
          title: p.title,
          options: [p.primary, p.secondary, p.third].filter(Boolean),
          askedAt: p.askedAt,
          askedAtTime: wallClock(p.askedAt),
          resolved: p.resolved,
          consensus: p.consensus,
          isCurrent: p.id === currentId,
        })
        p.thread.forEach((m, i) => out.push({
          kind: 'msg',
          predictionId: p.id,
          agent: m.agent,
          text: m.text,
          ts: m.ts,
        }))
      })
    return out
  }, [predictions, currentId])

  // Jump to a tip anchor in the main thread
  const jumpToTip = (predictionId) => {
    setSelectedId(predictionId)
    requestAnimationFrame(() => {
      const el = streamRef.current?.querySelector(`[data-tip="${predictionId}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el.classList.add('flash')
        setTimeout(() => el.classList.remove('flash'), 1100)
      }
    })
  }
  useEffect(() => {
    const el = streamRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [selected?.thread.length])

  const send = () => {
    const v = input.trim()
    if (!v) return
    setPredictions((prev) => prev.map((p) =>
      p.id !== selectedId ? p : {
        ...p,
        thread: [...p.thread, { ts: fmtMin(minute.current), agent: 'host', text: v }],
        comments: p.comments + 1,
      }
    ))
    setInput('')
    // simulate AI response 800ms later
    setTimeout(() => {
      setPredictions((prev) => prev.map((p) =>
        p.id !== selectedId ? p : {
          ...p,
          thread: [...p.thread, {
            ts: fmtMin(minute.current),
            agent: 'Stats Analyst',
            text: 'Re-running 4 agents with your context — give me 5s.',
          }],
        }
      ))
    }, 800)
  }

  return (
    <div className="pr-card">
      {/* AI Presenter bar — narrator avatar + waveform + mute toggle */}
      <PresenterBar />

      {/* HIDDEN: sub-prediction picker + hover timeline.
          Kept commented to make it easy to bring back later — just unwrap this block.

      <div className="pr-picker">
        <div className="pr-picker-bar">
          <span className="pr-picker-eyebrow">Predicting</span>
          <span className="pr-picker-title">{timeline[0]?.title || ''}</span>
          <span className="pr-picker-time">{wallClock(timeline[0]?.askedAt || 0)}</span>
          <span className="pr-picker-caret">⌄</span>
        </div>
        <div className="pr-timeline" role="menu">
          <div className="pr-timeline-head"><span>Prediction history</span></div>
          <div className="pr-timeline-row">
            {timeline.map((p) => {
              const isCurrent = p.id === currentId
              const finalAns = p.resolved ? p.consensus.replace(' — RESOLVED', '') : null
              return (
                <button
                  key={p.id}
                  role="menuitem"
                  className={
                    'pr-tl-card' +
                    (isCurrent ? ' is-current' : '') +
                    (p.id === selectedId ? ' is-active' : '') +
                    (p.resolved ? ' is-resolved' : '')
                  }
                  onClick={() => jumpToTip(p.id)}
                >
                  <div className="pr-tl-stamp">
                    <span className="pr-tl-time">{wallClock(p.askedAt)}</span>
                    <span className={'pr-tl-status ' + (isCurrent ? 'live' : p.resolved ? 'resolved' : 'past')}>
                      {isCurrent ? 'Live' : p.resolved ? 'Resolved' : 'Past'}
                    </span>
                  </div>
                  <div className="pr-tl-title">{p.title}</div>
                  <div className={'pr-tl-answer ' + (p.resolved ? 'resolved' : isCurrent ? 'live' : 'past')}>
                    {p.resolved ? `Answer · ${finalAns}` : isCurrent ? 'Predicting…' : 'See thread'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      */}

      {/* One merged chronological thread; tip cards anchor each prediction. */}
      <div className="pr-thread" ref={streamRef}>
        {flatThread.map((m, i) => {
          if (m.kind === 'tip') {
            const finalAns = m.resolved ? m.consensus.replace(' — RESOLVED', '') : null
            return (
              <div key={'tip-' + m.predictionId + '-' + i} className="pr-msg ai is-tip" data-tip={m.predictionId}>
                <div className="pr-msg-avatar tone-host-bot" aria-label="Host">⊕</div>
                <div className="pr-msg-body">
                  <div className="pr-msg-meta">
                    <span className="pr-msg-agent">Host</span>
                    <span className="pr-msg-ts">{m.askedAtTime}</span>
                    <span className={'pr-msg-tag ' + (m.isCurrent ? 'live' : m.resolved ? 'resolved' : 'past')}>
                      {m.isCurrent ? 'Predicting' : m.resolved ? 'Resolved' : 'Past'}
                    </span>
                  </div>
                  <div className={'pr-msg-bubble tip' + (m.isCurrent ? ' is-current' : '') + (m.resolved ? ' is-resolved' : '')}>
                    <div className="pr-tipmsg-q">{m.title}</div>
                    {m.resolved ? (
                      <div className="pr-tipmsg-answer">
                        <span className="pr-tipmsg-answer-lbl">Final answer</span>
                        <span className="pr-tipmsg-answer-val">{finalAns}</span>
                      </div>
                    ) : (
                      <div className="pr-tipmsg-options">
                        {m.options.map((o) => (
                          <span key={o.label} className="pr-tipmsg-chip">
                            {o.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          }
          const isHost = m.agent === 'host'
          const tone = AGENT_TONE[m.agent] || 'mint'
          return (
            <div key={i} className={'pr-msg ' + (isHost ? 'host' : 'ai')}>
              <div className={'pr-msg-avatar tone-' + (isHost ? 'host' : tone)}>
                {isHost ? 'H' : m.agent.slice(0, 1)}
              </div>
              <div className="pr-msg-body">
                <div className="pr-msg-meta">
                  <span className="pr-msg-agent">{isHost ? 'Host' : m.agent}</span>
                  <span className="pr-msg-ts">{m.ts}</span>
                </div>
                <div className={'pr-msg-bubble ' + (isHost ? 'host' : 'ai')}>{m.text}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Composer — only enabled on the current (newest) question */}
      <div className="pr-input-row">
        <button className="pr-mic" aria-label="Voice" title="Push to talk" disabled={isViewingHistory}>●</button>
        <input
          className="pr-input"
          placeholder={isViewingHistory
            ? 'Viewing past question — switch back to the latest to chat.'
            : `Ask the agents about: ${selected.title.toLowerCase()}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={isViewingHistory}
        />
        <button className="pr-send" onClick={send} disabled={isViewingHistory}>Send</button>
      </div>
    </div>
  )
}
