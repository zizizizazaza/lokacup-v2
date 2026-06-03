import { useEffect, useRef, useState } from 'react'

const AGENT_DEFS = {
  stats:   { name: 'Stats',   tone: 'mint',  short: 'ST' },
  odds:    { name: 'Odds',    tone: 'gold',  short: 'OD' },
  news:    { name: 'News',    tone: 'coral', short: 'NW' },
  tactics: { name: 'Tactics', tone: 'cyan',  short: 'TA' },
}

const INITIAL_AGENTS = {
  stats:   { side: 'a', chips: 72 },
  odds:    { side: 'a', chips: 58 },
  news:    { side: 'b', chips: 41 }, // dissenter
  tactics: { side: 'a', chips: 65 },
}

// Sample reasons per move kind — surfaced in the log
const REASONS = {
  raise: [
    'xG diff still favours the lead', 'whale just printed YES on Polymarket',
    'lineup confirmed — sub at 70′', 'second-ball wins climbing for the lead',
    'press resistance ratio holding', 'shot map skewing to the lead box',
  ],
  trim: [
    'momentum cooling, trimming', 'mean-reverting after the chance',
    'liquidity thinning at the top', 'card risk on key shielding player',
  ],
  flip: [
    'momentum has flipped — switching side', 'sub changes the matchup',
    'Bet365 now disagrees — moving with sharps', 'data agent updated weights',
  ],
  hold: [
    'no new signal', 'waiting on the next event',
    'confidence interval too wide', 'cooldown after the last move',
  ],
}

function chipFromMove(kind) {
  if (kind === 'raise') return 6 + Math.floor(Math.random() * 12) // +6 to +17
  if (kind === 'trim')  return -(4 + Math.floor(Math.random() * 8)) // -4 to -11
  if (kind === 'flip')  return 18 + Math.floor(Math.random() * 18) // 18..35 moved across
  return 0
}

function randomMove(idx, agents) {
  // Bias against flipping too much; reward holding
  const r = Math.random()
  if (r < 0.55) return 'raise'
  if (r < 0.80) return 'trim'
  if (r < 0.92) return 'hold'
  return 'flip'
}

const PAIR = { a: { code: 'BRA', flag: 'br', label: 'Brazil' }, b: { code: 'MAR', flag: 'ma', label: 'Morocco' } }

function ChipStack({ count, tone }) {
  // Build a visual stack: ~1 chip per 7 chips of value
  const visible = Math.max(1, Math.min(10, Math.round(count / 7)))
  return (
    <div className="bt-stack" data-count={count}>
      {Array.from({ length: visible }).map((_, i) => (
        <span key={i} className={'bt-chip tone-' + tone} style={{ bottom: i * 4 + 'px', zIndex: i }} />
      ))}
    </div>
  )
}

function Seat({ k, agent, pulse }) {
  const def = AGENT_DEFS[k]
  return (
    <div className={'bt-seat pos-' + k + (pulse ? ' pulse' : '')}>
      <div className={'bt-bot tone-' + def.tone}>
        <span className="bt-bot-eye left" />
        <span className="bt-bot-eye right" />
        <span className="bt-bot-antenna" />
      </div>
      <div className="bt-seat-name">{def.name}</div>
      <div className={'bt-side-tag side-' + agent.side}>
        <img className="flag" alt="" src={`https://flagcdn.com/w20/${PAIR[agent.side].flag}.png`} />
        {PAIR[agent.side].code}
      </div>
      <ChipStack count={agent.chips} tone={def.tone} />
      <div className="bt-chip-count">{agent.chips}</div>
    </div>
  )
}

function fmtMin(m) { return `${m}′` }

export default function BettingTable() {
  const [agents, setAgents] = useState(INITIAL_AGENTS)
  const [log, setLog] = useState([
    { k: 'stats',   kind: 'raise', delta: 12, side: 'a', text: 'xG diff still favours BRA', t: '64′' },
    { k: 'news',    kind: 'flip',  delta: 14, side: 'b', text: 'Reuters injury changes the calc', t: '66′' },
    { k: 'odds',    kind: 'raise', delta: 8,  side: 'a', text: 'whale printed $42k YES', t: '67′' },
  ])
  const [pulse, setPulse] = useState(null) // agent key currently being highlighted
  const minute = useRef(67)

  useEffect(() => {
    const id = setInterval(() => {
      // pick a random agent and have them act
      const keys = Object.keys(AGENT_DEFS)
      const k = keys[Math.floor(Math.random() * keys.length)]
      setPulse(k)
      setTimeout(() => setPulse(null), 1100)

      setAgents((prev) => {
        const cur = { ...prev[k] }
        const kind = randomMove()
        const reason = REASONS[kind][Math.floor(Math.random() * REASONS[kind].length)]
        let delta = chipFromMove(kind)
        let newSide = cur.side

        if (kind === 'raise') {
          cur.chips = Math.min(120, cur.chips + delta)
        } else if (kind === 'trim') {
          cur.chips = Math.max(10, cur.chips + delta) // delta is negative
        } else if (kind === 'flip') {
          newSide = cur.side === 'a' ? 'b' : 'a'
          cur.side = newSide
          // big move: takes its current pile + adds a small bonus
          cur.chips = Math.max(20, cur.chips - 12) + 18
          delta = '↔'
        } else {
          delta = 0
        }

        // append to log
        minute.current += 1
        setLog((l) => [...l.slice(-30), {
          k,
          kind,
          delta,
          side: newSide,
          text: reason,
          t: fmtMin(minute.current),
        }])

        return { ...prev, [k]: cur }
      })
    }, 3600)
    return () => clearInterval(id)
  }, [])

  // weighted consensus
  const total = Object.values(agents).reduce((s, a) => s + a.chips, 0)
  const sideA = Object.entries(agents).reduce((s, [_, a]) => s + (a.side === 'a' ? a.chips : 0), 0)
  const probA = Math.round((sideA / total) * 100)
  const probB = 100 - probA
  const lead = probA >= probB ? 'a' : 'b'

  const onSideA = Object.entries(agents).filter(([_, a]) => a.side === 'a').length
  const onSideB = 4 - onSideA

  return (
    <div className="bt-card">
      <div className="bt-card-head">
        <div>
          <h3>Live betting table</h3>
          <div className="bt-card-sub">4 agents · live · {fmtMin(minute.current)}</div>
        </div>
        <div className="bt-card-meta">
          <span className="bt-meta-chip">{onSideA} on BRA</span>
          <span className="bt-meta-chip">{onSideB} on MAR</span>
        </div>
      </div>

      <div className="bt-stage">
        {/* center felt with consensus */}
        <div className="bt-center">
          <div className="bt-center-ring">
            <svg viewBox="0 0 120 120" width="100" height="100">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="var(--accent-red)"
                strokeWidth="8"
                strokeDasharray={`${(probA/100)*339} 339`}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <div className="bt-center-inner">
              <div className="bt-center-label">Consensus</div>
              <div className={'bt-center-val ' + (lead === 'a' ? 'lead-a' : 'lead-b')}>
                {lead === 'a' ? probA : probB}<span>%</span>
              </div>
              <div className="bt-center-side">
                <img alt="" className="flag" src={`https://flagcdn.com/w20/${PAIR[lead].flag}.png`} />
                {PAIR[lead].label}
              </div>
            </div>
          </div>

          <div className="bt-side-totals">
            <div className={'bt-side-total side-a' + (lead === 'a' ? ' lead' : '')}>
              <img alt="" className="flag" src="https://flagcdn.com/w20/br.png" /> BRA <b>{probA}%</b>
            </div>
            <div className="bt-vs-dash">VS</div>
            <div className={'bt-side-total side-b' + (lead === 'b' ? ' lead' : '')}>
              <b>{probB}%</b> MAR <img alt="" className="flag" src="https://flagcdn.com/w20/ma.png" />
            </div>
          </div>
        </div>

        {/* 4 seats — one per corner */}
        <Seat k="stats"   agent={agents.stats}   pulse={pulse === 'stats'} />
        <Seat k="odds"    agent={agents.odds}    pulse={pulse === 'odds'} />
        <Seat k="news"    agent={agents.news}    pulse={pulse === 'news'} />
        <Seat k="tactics" agent={agents.tactics} pulse={pulse === 'tactics'} />
      </div>

      <div className="bt-log">
        <div className="bt-log-head">Last moves</div>
        <div className="bt-log-list">
          {log.slice().reverse().slice(0, 3).map((m, i) => {
            const def = AGENT_DEFS[m.k]
            return (
              <div key={i} className={'bt-log-row ' + m.kind}>
                <span className={'bt-log-min'}>{m.t}</span>
                <span className={'bt-log-who tone-' + def.tone}>{def.name}</span>
                <span className={'bt-log-action ' + m.kind}>
                  {m.kind === 'raise' && <>raised <b className="up">+{m.delta}</b> on <em>{PAIR[m.side].code}</em></>}
                  {m.kind === 'trim'  && <>trimmed <b className="down">{m.delta}</b> on <em>{PAIR[m.side].code}</em></>}
                  {m.kind === 'flip'  && <>switched to <em className="flip">{PAIR[m.side].code}</em></>}
                  {m.kind === 'hold'  && <>holds — no move</>}
                </span>
                <span className="bt-log-reason">"{m.text}"</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
