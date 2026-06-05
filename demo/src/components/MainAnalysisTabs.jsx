import { useEffect, useMemo, useState } from 'react'
import { flagSrc } from './Flag.jsx'

// Build a longer probability curve for the MAIN market (single big chart)
function MainProbCurve({ aiA, aiB, pairA, pairB }) {
  const SERIES = 90
  const [hist, setHist] = useState(() => {
    const out = []
    let a = aiA - 8, b = aiB - 5, d = Math.max(2, 100 - a - b)
    for (let i = 0; i < SERIES; i++) {
      a += (Math.random() - 0.5) * 2.6
      b += (Math.random() - 0.5) * 2.2
      d += (Math.random() - 0.5) * 1.4
      a = Math.max(6, Math.min(86, a))
      b = Math.max(6, Math.min(86, b))
      d = Math.max(2, Math.min(28, d))
      const s = a + b + d
      out.push({ a: (a / s) * 100, b: (b / s) * 100, d: (d / s) * 100 })
    }
    return out
  })
  useEffect(() => {
    const id = setInterval(() => {
      setHist((prev) => {
        const last = prev[prev.length - 1]
        let a = last.a + (Math.random() - 0.5) * 3
        let b = last.b + (Math.random() - 0.5) * 2.6
        let d = last.d + (Math.random() - 0.5) * 1.5
        a = Math.max(6, Math.min(86, a)); b = Math.max(6, Math.min(86, b)); d = Math.max(2, Math.min(28, d))
        const s = a + b + d
        return [...prev.slice(-(SERIES - 1)), { a: (a / s) * 100, b: (b / s) * 100, d: (d / s) * 100 }]
      })
    }, 2200)
    return () => clearInterval(id)
  }, [])
  const w = 720, h = 220, padL = 36, padR = 56, padT = 18, padB = 26
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const step = innerW / (hist.length - 1)
  const yOf = (v) => padT + innerH - (v / 100) * innerH
  const ptsA = hist.map((p, i) => `${padL + i * step},${yOf(p.a)}`).join(' ')
  const ptsB = hist.map((p, i) => `${padL + i * step},${yOf(p.b)}`).join(' ')
  const ptsD = hist.map((p, i) => `${padL + i * step},${yOf(p.d)}`).join(' ')
  const last = hist[hist.length - 1]
  return (
    <div className="mac-curve">
      <svg viewBox={`0 0 ${w} ${h}`} className="mac-curve-svg" preserveAspectRatio="none">
        {[25, 50, 75].map((g) => (
          <g key={g}>
            <line x1={padL} x2={padL + innerW} y1={yOf(g)} y2={yOf(g)} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
            <text x={padL - 6} y={yOf(g) + 3} fontSize="9" textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-data)">{g}%</text>
          </g>
        ))}
        <polyline points={ptsD} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" />
        <polyline points={ptsB} fill="none" stroke="var(--accent-blue)" strokeWidth="1.8" />
        <polyline points={ptsA} fill="none" stroke="var(--accent-red)" strokeWidth="2.2" style={{ filter: 'drop-shadow(0 0 5px var(--accent-red))' }} />
        <circle cx={padL + (hist.length - 1) * step} cy={yOf(last.a)} r="3.5" fill="var(--accent-red)" />
        <circle cx={padL + (hist.length - 1) * step} cy={yOf(last.b)} r="3"   fill="var(--accent-blue)" />
        <circle cx={padL + (hist.length - 1) * step} cy={yOf(last.d)} r="3"   fill="rgba(255,255,255,0.7)" />
        <text x={padL + innerW + 8} y={yOf(last.a) + 3} fontSize="11" fill="var(--accent-red)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.a)}%</text>
        <text x={padL + innerW + 8} y={yOf(last.b) + 3} fontSize="11" fill="var(--accent-blue)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.b)}%</text>
        <text x={padL + innerW + 8} y={yOf(last.d) + 3} fontSize="11" fill="rgba(255,255,255,0.7)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.d)}%</text>
      </svg>
      <div className="mac-legend">
        <span className="mac-leg bra"><i /> {pairA}</span>
        <span className="mac-leg draw"><i /> Draw</span>
        <span className="mac-leg mar"><i /> {pairB}</span>
      </div>
    </div>
  )
}

// Each agent's stance for a round.
// `prob` is the agent's own estimate that ${pair.a} is the answer.
// `prev` is its prob in the previous round (null if first round).
// `note` is one plain-English sentence — agent's reason for this stance.
function buildRounds(pair) {
  const A = pair.a, B = pair.b
  return [
    {
      id: 'R4',
      label: 'Round 4',
      t: '21:09 · 62′',
      status: 'discussing',
      trigger: { kind: 'card', text: `Casemiro just took a yellow — sub watch is on.` },
      verdict: null,
      partial: `${A} bench depth and ${B}'s shape still being modeled. Early lean ${A} 70–75%.`,
    },
    {
      id: 'R3',
      label: 'Round 3',
      t: '21:05 · 58′',
      trigger: { kind: 'goal', text: `Vinícius scored — ${A} 2, ${B} 1` },
      verdict: { side: A, prob: 73, mood: 'Backing ' + A, note: 'Most agents grew more confident' },
      stances: [
        { agent: 'Stats Analyst',  prob: 80, prev: 68, note: `xG difference widened. ${A} sustaining pressure since 55′.` },
        { agent: 'Market Analyst', prob: 70, prev: 68, note: `Polymarket priced ${A} at 68% — still cheaper than AI sees it.` },
        { agent: 'News Analyst',  prob: 65, prev: 70, note: `Casemiro on a yellow — he could be subbed off before 75′.` },
        { agent: 'Tactics Analyst', prob: 78, prev: 67, note: `${B} dropped to a back-five and can't escape ${A}'s press.` },
      ],
      consensus: [
        `${A} firmly favored — 3 of 4 agents above 70%.`,
        `Both the scoreboard and the pressure data point the same way.`,
      ],
      disagreement: [
        `News pulled back: a Casemiro sub could re-open the midfield.`,
        `Stats is the boldest (80%); News is the most cautious (65%).`,
      ],
    },
    {
      id: 'R2',
      label: 'Round 2',
      t: '20:48 · 41′',
      trigger: { kind: 'goal', text: `Hakimi equalized — ${A} 1, ${B} 1` },
      verdict: { side: A, prob: 67, mood: 'Still favors ' + A, note: 'Confidence pulled back across the board' },
      stances: [
        { agent: 'Stats Analyst',  prob: 68, prev: 73, note: `${A} still favored but the model gives ${B} more weight after the goal.` },
        { agent: 'Market Analyst', prob: 68, prev: 58, note: `Polymarket caught up — fair value and market are now in line.` },
        { agent: 'News Analyst',  prob: 70, prev: 70, note: `${A}'s bench depth still favors them late.` },
        { agent: 'Tactics Analyst', prob: 67, prev: 72, note: `${B}'s press is leaking on the right — expect fatigue at 70′.` },
      ],
      consensus: [
        `${A} still ahead in the model, but margin compressed.`,
        `Market and AI are now aligned — no clear edge to act on.`,
      ],
      disagreement: [
        `Stats and Tactics split on whether ${B}'s counter is repeatable.`,
      ],
    },
    {
      id: 'R1',
      label: 'Round 1',
      t: '20:23 · 23′',
      trigger: { kind: 'goal', text: `Neymar opened — ${A} 1, ${B} 0` },
      verdict: { side: A, prob: 71, mood: 'Backing ' + A, note: 'Strong agreement out of the gate' },
      stances: [
        { agent: 'Stats Analyst',  prob: 73, prev: null, note: `Pre-match ${A} 65% → 73% after the early goal.` },
        { agent: 'Market Analyst', prob: 58, prev: null, note: `Polymarket opened ${A} at 58% — lagging fair value.` },
        { agent: 'News Analyst',  prob: 70, prev: null, note: `Neymar confirmed fit; lineup signals attacking intent.` },
        { agent: 'Tactics Analyst', prob: 72, prev: null, note: `${A}'s press is disrupting ${B}'s build-up early.` },
      ],
      consensus: [
        `All four agents back ${A} after the opening goal.`,
        `Market is 13 points behind AI — clearest edge of the match so far.`,
      ],
      disagreement: [
        `Odds is the most cautious (58%) — flags that the whale flow could be noise.`,
      ],
    },
  ]
}

// Hard-coded "related markets" pool for demo
const RELATED = [
  { title: 'Brazil to win the World Cup',           yes: 21, no: 79, vol: '$2.3M' },
  { title: 'Vinícius to score anytime',             yes: 64, no: 36, vol: '$420k' },
  { title: 'Match total goals — Over 2.5',          yes: 71, no: 29, vol: '$880k' },
  { title: 'Both teams to score',                   yes: 68, no: 32, vol: '$510k' },
  { title: 'Brazil to win to nil',                  yes: 22, no: 78, vol: '$190k' },
  { title: 'Morocco to score in 2nd half',          yes: 42, no: 58, vol: '$260k' },
  { title: 'Casemiro to be booked',                 yes: 38, no: 62, vol: '$95k'  },
  { title: 'Match to go to extra time',             yes: 11, no: 89, vol: '$140k' },
]

export default function MainAnalysisTabs({ market, pair }) {
  const [tab, setTab] = useState('main')
  const [openRounds, setOpenRounds] = useState(() => new Set()) // all collapsed by default
  const toggleRound = (id) =>
    setOpenRounds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  const aiA = market.aiConsensus
  const aiB = Math.max(0, 100 - aiA)
  const edge = market.edge ?? 0

  // Multi-round debate — each round triggered by a match/news event.
  // Newest round first. Each agent has a stance (long/short/neutral), confidence, brief.
  // Round 1 carries no "delta" because it's the baseline.
  const rounds = useMemo(() => buildRounds(pair), [pair.a, pair.b])

  return (
    <div className="mac mac-rounds-only">
      <div className="mac-section">
        <div className="mac-section-head">
          <h4>AI debate rounds</h4>
          <span className="mac-section-meta">{rounds.length} rounds · live</span>
        </div>
        <div className="mac-rounds">
              {rounds.map((r) => {
                const isOpen = openRounds.has(r.id)
                const isDiscussing = r.status === 'discussing'
                const triggerIcon = r.trigger.kind === 'card' ? '🟨'
                                  : r.trigger.kind === 'news' ? '📰'
                                  : '⚽'
                return (
                  <article
                    key={r.id}
                    className={
                      'mac-round'
                      + (isDiscussing ? ' is-discussing' : '')
                      + (isOpen ? ' is-open' : '')
                    }
                  >
                    {/* Collapsed header — always visible. Click to toggle (unless in-progress). */}
                    <button
                      type="button"
                      className="mac-round-summary"
                      aria-expanded={isOpen}
                      onClick={() => !isDiscussing && toggleRound(r.id)}
                      disabled={isDiscussing}
                    >
                      <div className="mac-round-summary-top">
                        <span className="mac-round-label">{r.label}</span>
                        <span className="mac-round-t">{r.t}</span>
                        {isDiscussing && (
                          <span className="mac-round-discussing">
                            <span className="mac-round-pulse" aria-hidden />
                            Discussing
                          </span>
                        )}
                        {!isDiscussing && !r.status && r.id === 'R3' && <span className="mac-round-live">LATEST</span>}
                        {!isDiscussing && (
                          <span className={'mac-round-chevron' + (isOpen ? ' is-open' : '')} aria-hidden>▾</span>
                        )}
                      </div>
                      <div className="mac-trigger">
                        <span className="mac-trigger-icon" aria-hidden>{triggerIcon}</span>
                        <span className="mac-trigger-text">{r.trigger.text}</span>
                      </div>
                      {isDiscussing ? (
                        <div className="mac-verdict-line discussing">
                          <span className="mac-verdict-mood">Analyzing…</span>
                          <span className="mac-verdict-note">{r.partial}</span>
                        </div>
                      ) : (
                        <div className="mac-verdict-line">
                          <span className="mac-verdict-mood">{r.verdict.mood}</span>
                          <span className="mac-verdict-prob">{r.verdict.prob}% likely</span>
                          <span className="mac-verdict-note">— {r.verdict.note}</span>
                        </div>
                      )}
                    </button>

                    {/* Expandable body — only for completed rounds */}
                    {isOpen && !isDiscussing && (
                      <div className="mac-round-body">
                        {/* Analyst opinions */}
                        <section className="mac-section-block mac-block-analysts">
                          <div className="mac-block-head">
                            <span className="mac-block-head-icon" aria-hidden>👥</span>
                            <span className="mac-block-head-text">Analyst opinions</span>
                          </div>
                          <div className="mac-agents">
                            {r.stances.map((s) => {
                              const delta = s.prev == null ? null : s.prob - s.prev
                              const dir = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
                              return (
                                <div key={s.agent} className={'mac-agent dir-' + dir}>
                                  <div className="mac-agent-row1">
                                    <span className="mac-agent-name">{s.agent}</span>
                                    <span className="mac-agent-prob">{s.prob}%</span>
                                  </div>
                                  <div className="mac-agent-row2">
                                    {delta == null ? (
                                      <span className="mac-agent-change">first round</span>
                                    ) : delta === 0 ? (
                                      <span className="mac-agent-change">unchanged from {s.prev}%</span>
                                    ) : (
                                      <span className={'mac-agent-change dir-' + dir}>
                                        {dir === 'up' ? '↑ more confident' : '↓ less confident'} · was {s.prev}%
                                      </span>
                                    )}
                                  </div>
                                  <div className="mac-agent-note">{s.note}</div>
                                </div>
                              )
                            })}
                          </div>
                        </section>

                        {/* Group takeaways — visually distinct from analyst grid */}
                        <section className="mac-section-block mac-block-takeaways">
                          <div className="mac-take-grid">
                            <div className="mac-take mac-take-yes">
                              <div className="mac-take-head">
                                <span className="mac-take-icon" aria-hidden>✓</span>
                                <span>Where they agree</span>
                              </div>
                              <ul>{r.consensus.map((c, i) => <li key={i}>{c}</li>)}</ul>
                            </div>
                            <div className="mac-take mac-take-no">
                              <div className="mac-take-head">
                                <span className="mac-take-icon" aria-hidden>✕</span>
                                <span>Where they disagree</span>
                              </div>
                              <ul>{r.disagreement.map((d, i) => <li key={i}>{d}</li>)}</ul>
                            </div>
                          </div>
                        </section>
                      </div>
                    )}
                  </article>
                )
              })}
        </div>
      </div>
    </div>
  )
}
