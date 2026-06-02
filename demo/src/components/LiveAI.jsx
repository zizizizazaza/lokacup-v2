import { useEffect, useRef, useState } from 'react'

const AGENTS = {
  stats:   { name: 'Stats',   tone: 'mint',  desc: 'FBref · xG · H2H · ELO' },
  odds:    { name: 'Odds',    tone: 'gold',  desc: 'Polymarket · Bet365 · whales' },
  news:    { name: 'News',    tone: 'coral', desc: 'Lineups · injuries · social' },
  tactics: { name: 'Tactics', tone: 'cyan',  desc: 'Formations · matchups' },
}

// Pool of streaming analysis lines. The feed picks from these and appends new ones every few seconds.
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

export default function LiveAI() {
  const [feed, setFeed] = useState(() => POOL.slice(0, 4).map((p, i) => ({ ...p, id: i, t: fmtMin(58 + i) })))
  const [eventIdx, setEventIdx] = useState(0)
  const counter = useRef(feed.length)
  const minute = useRef(62)

  useEffect(() => {
    const id = setInterval(() => {
      counter.current += 1
      minute.current += 1

      // Roughly every 3 ticks, inject a match event instead of an agent line
      if (counter.current % 4 === 0 && eventIdx < EVENTS.length) {
        const ev = EVENTS[eventIdx]
        setFeed((prev) => [...prev.slice(-30), { id: counter.current, kind: 'event', event: ev, t: fmtMin(ev.min) }])
        setEventIdx((i) => i + 1)
        return
      }

      const pick = POOL[counter.current % POOL.length]
      setFeed((prev) => [...prev.slice(-30), { id: counter.current, ...pick, t: fmtMin(minute.current) }])
    }, 3200)
    return () => clearInterval(id)
  }, [eventIdx])

  // Always scroll latest into view
  const streamRef = useRef(null)
  useEffect(() => {
    const el = streamRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [feed])

  return (
    <div className="live-ai">
      <div className="live-ai-head">
        <div className="live-match">
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
            <span className="live-dot" /> Live · {fmtMin(minute.current)} · Quarter-final
          </div>
        </div>
        <div className="live-consensus">
          <div className="consensus-head">
            <span>AI win probability</span>
            <span className="consensus-sub">vs market</span>
          </div>
          <div className="consensus-rows">
            <div className="prob-row">
              <span className="prob-name">Brazil</span>
              <span className="prob-bar"><span className="prob-fill ai" style={{ width: '61%' }} /></span>
              <span className="prob-val ai">61%</span>
              <span className="prob-mkt">market 56%</span>
            </div>
            <div className="prob-row">
              <span className="prob-name">Germany</span>
              <span className="prob-bar"><span className="prob-fill" style={{ width: '24%' }} /></span>
              <span className="prob-val">24%</span>
              <span className="prob-mkt">market 28%</span>
            </div>
            <div className="prob-row">
              <span className="prob-name">Draw</span>
              <span className="prob-bar"><span className="prob-fill" style={{ width: '15%' }} /></span>
              <span className="prob-val">15%</span>
              <span className="prob-mkt">market 16%</span>
            </div>
          </div>
        </div>
      </div>

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
        <span className="typing">
          <i /><i /><i />
        </span>
        <span>4 agents analyzing in parallel</span>
      </div>
    </div>
  )
}
