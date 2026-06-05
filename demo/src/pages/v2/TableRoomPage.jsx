import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { getTable, ME_HANDLE } from '../../data/tables'
import { withFlags, flagSrc } from '../../components/Flag.jsx'
import { IconSend } from '../../components/Icons.jsx'
import PredictionRoom from '../../components/PredictionRoom.jsx'
import BasicDataTabs from '../../components/BasicDataTabs.jsx'
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

// Compact probability curve for the right-rail "who wins" view.
// Same data shape as the bigger MainProbCurve but smaller and tuned for the narrow rail.
function RailProbCurve({ aiA, aiB, pairA, pairB, flatten = false }) {
  const SERIES = 56
  const [hist, setHist] = useState(() => {
    // Upcoming tables show a flat baseline rather than fake history
    if (flatten) {
      return Array.from({ length: SERIES }, () => ({ a: aiA, b: aiB, d: Math.max(0, 100 - aiA - aiB) }))
    }
    const out = []
    let a = aiA - 6, b = aiB - 4, d = Math.max(2, 100 - a - b)
    for (let i = 0; i < SERIES; i++) {
      a += (Math.random() - 0.5) * 2.2
      b += (Math.random() - 0.5) * 2
      d += (Math.random() - 0.5) * 1.2
      a = Math.max(6, Math.min(86, a))
      b = Math.max(6, Math.min(86, b))
      d = Math.max(2, Math.min(28, d))
      const s = a + b + d
      out.push({ a: (a / s) * 100, b: (b / s) * 100, d: (d / s) * 100 })
    }
    return out
  })
  useEffect(() => {
    if (flatten) return  // Upcoming tables: no live ticking, curve stays flat
    const id = setInterval(() => {
      setHist((prev) => {
        const last = prev[prev.length - 1]
        let a = last.a + (Math.random() - 0.5) * 2.6
        let b = last.b + (Math.random() - 0.5) * 2.2
        let d = last.d + (Math.random() - 0.5) * 1.4
        a = Math.max(6, Math.min(86, a)); b = Math.max(6, Math.min(86, b)); d = Math.max(2, Math.min(28, d))
        const s = a + b + d
        return [...prev.slice(-(SERIES - 1)), { a: (a / s) * 100, b: (b / s) * 100, d: (d / s) * 100 }]
      })
    }, 2200)
    return () => clearInterval(id)
  }, [flatten])

  const w = 320, h = 90, padL = 26, padR = 44, padT = 8, padB = 16
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const step = innerW / (hist.length - 1)
  const yOf = (v) => padT + innerH - (v / 100) * innerH
  const ptsA = hist.map((p, i) => `${padL + i * step},${yOf(p.a)}`).join(' ')
  const ptsB = hist.map((p, i) => `${padL + i * step},${yOf(p.b)}`).join(' ')
  const ptsD = hist.map((p, i) => `${padL + i * step},${yOf(p.d)}`).join(' ')
  const last = hist[hist.length - 1]

  return (
    <div className="rail-curve">
      <div className="rail-curve-head">
        <span>Win probability · last 56 ticks</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="rail-curve-svg" preserveAspectRatio="none">
        {[25, 50, 75].map((g) => (
          <g key={g}>
            <line x1={padL} x2={padL + innerW} y1={yOf(g)} y2={yOf(g)} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
            <text x={padL - 5} y={yOf(g) + 3} fontSize="7" textAnchor="end" fill="rgba(255,255,255,0.36)" fontFamily="var(--font-data)">{g}%</text>
          </g>
        ))}
        <polyline points={ptsD} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
        <polyline points={ptsB} fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" />
        <polyline points={ptsA} fill="none" stroke="var(--accent-red)"  strokeWidth="1.8" style={{ filter: 'drop-shadow(0 0 4px rgba(217,28,28,0.45))' }} />
        <circle cx={padL + (hist.length - 1) * step} cy={yOf(last.a)} r="2.5" fill="var(--accent-red)" />
        <circle cx={padL + (hist.length - 1) * step} cy={yOf(last.b)} r="2.2" fill="var(--accent-blue)" />
        <circle cx={padL + (hist.length - 1) * step} cy={yOf(last.d)} r="2.2" fill="rgba(255,255,255,0.7)" />
        <text x={padL + innerW + 6} y={yOf(last.a) + 3} fontSize="9" fill="var(--accent-red)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.a)}%</text>
        <text x={padL + innerW + 6} y={yOf(last.b) + 3} fontSize="9" fill="var(--accent-blue)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.b)}%</text>
        <text x={padL + innerW + 6} y={yOf(last.d) + 3} fontSize="9" fill="rgba(255,255,255,0.7)" fontFamily="var(--font-data)" fontWeight="700">{Math.round(last.d)}%</text>
      </svg>
      <div className="rail-curve-legend">
        <span><i style={{ background: 'var(--accent-red)' }} /> {pairA}</span>
        <span><i style={{ background: 'rgba(255,255,255,0.5)' }} /> Draw</span>
        <span><i style={{ background: 'var(--accent-blue)' }} /> {pairB}</span>
      </div>
    </div>
  )
}

// Vote / bet panel. Adapts layout to outcome count:
//  • 2 outcomes → big side-by-side cards (Polymarket binary look)
//  • 3-4 outcomes → row list with probability bar
//  • 5+        → row list w/ internal scroll
// Points: 25 × difficulty × time per docs/points-system.md §2.1
// Settled rail — replaces AI Conclusion + Vote panel when a Table has finished.
// 3 segments per spec §3.4: Final hero, frozen curve, my prediction settlement.
function SettledRail({ table, pair, aiA, aiB, flagA, flagB, FieldGlobe }) {
  // Derive winning side from the binary outcome (a/b) or explicit outcomes list
  const outcomes = table.market.outcomes
  const winningId = table.winningOutcomeId
  const winningSide = outcomes
    ? outcomes.find((o) => o.id === winningId)
    : { id: winningId, label: winningId === 'a' ? pair.a : pair.b }

  // Mock "my pick" for the demo — alternate per table id so we get both win and lose states
  const myPickId = (table.id.charCodeAt(0) % 2 === 0) ? 'a' : winningId
  const myPickWon = myPickId === winningId
  const hadPick = !!myPickId
  const myLabel = outcomes
    ? outcomes.find((o) => o.id === myPickId)?.label
    : (myPickId === 'a' ? pair.a : pair.b)

  // Reuse points formula from VotePanel
  const probForMyPick = outcomes
    ? (table.market.probs?.[myPickId] ?? aiA)
    : (myPickId === 'a' ? aiA : aiB)
  const mult = probForMyPick > 65 ? 1.0 : probForMyPick > 40 ? 2.0 : probForMyPick > 20 ? 2.5 : 3.0
  const pts = Math.round(25 * mult * 1.0)

  return (
    <>
      <div className="settled-hero">
        <span className="settled-pill">FINAL</span>
        <div className="settled-hero-row">
          {flagA ? <img className="flag" alt="" src={flagA} /> : <FieldGlobe />}
          <span className="settled-hero-side">{winningSide?.label || pair.a}</span>
          <span className="settled-hero-verb">won</span>
        </div>
        {table.finalSummary && (
          <div className="settled-hero-sub">{table.finalSummary}</div>
        )}
        <RailProbCurve aiA={aiA} aiB={aiB} pairA={pair.a} pairB={pair.b} flatten />
      </div>

      <div className={'settled-mypick ' + (hadPick ? (myPickWon ? 'is-won' : 'is-lost') : 'is-none')}>
        {!hadPick ? (
          <>
            <span className="settled-mypick-icon">—</span>
            <div className="settled-mypick-body">
              <div className="settled-mypick-status">You didn't predict</div>
              <div className="settled-mypick-sub">Lock in next time before kickoff</div>
            </div>
          </>
        ) : (
          <>
            <span className="settled-mypick-icon">{myPickWon ? '✓' : '✕'}</span>
            <div className="settled-mypick-body">
              <div className="settled-mypick-status">
                {myPickWon ? 'Predicted correctly' : 'Predicted wrong'}
              </div>
              <div className="settled-mypick-sub">
                Your pick: <strong>{myLabel}</strong>
              </div>
            </div>
            <div className={'settled-mypick-pts ' + (myPickWon ? 'is-won' : 'is-lost')}>
              {myPickWon ? `+${pts} pts` : '0 pts'}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function VotePanel({ market, pair, aiA, aiB, flagA, flagB, FieldGlobe }) {
  const [pick, setPick] = useState(null)
  const [locked, setLocked] = useState(false)
  const pointsFor = (prob) => {
    const mult = prob > 65 ? 1.0 : prob > 40 ? 2.0 : prob > 20 ? 2.5 : 3.0
    return Math.round(25 * mult * 1.0)
  }
  // Derive outcomes: explicit market.outcomes wins, else binary fallback from pair
  const outcomes = market?.outcomes && market.outcomes.length >= 2
    ? market.outcomes.map((o) => ({
        ...o,
        prob: market.probs?.[o.id] ?? 0,
      }))
    : [
        { id: 'a', label: pair.a, tone: 'a', prob: aiA, flagSrc: flagA },
        { id: 'b', label: pair.b, tone: 'b', prob: aiB, flagSrc: flagB },
      ]
  const submit = () => { if (pick) setLocked(true) }
  const picked = outcomes.find((o) => o.id === pick)
  const isMulti = outcomes.length >= 3

  return (
    <div className={'vp' + (isMulti ? ' vp-multi' : '')}>
      <div className="vp-head">
        <span className="vp-title">Place your prediction</span>
        <span className="vp-sub">
          {isMulti ? `Pick one of ${outcomes.length} outcomes` : 'Pick a side'} · lock in before resolution
        </span>
      </div>

      {isMulti ? (
        <div className="vp-rows" style={outcomes.length > 5 ? { maxHeight: '240px', overflowY: 'auto' } : undefined}>
          {outcomes.map((o) => {
            const on = pick === o.id
            return (
              <button
                key={o.id}
                type="button"
                className={'vp-row vp-tone-' + (o.tone || 'gray')
                  + (on ? ' is-selected' : '')
                  + (locked && !on ? ' is-dim' : '')}
                disabled={locked}
                onClick={() => !locked && setPick(o.id)}
              >
                <span className="vp-row-dot" />
                {o.flag
                  ? <img className="flag vp-row-flag" alt="" src={`https://flagcdn.com/${o.flag}.svg`} />
                  : <span className="flag vp-row-flag vp-row-flag-blank" aria-hidden />}
                <span className="vp-row-name">{o.label}</span>
                <span className="vp-row-bar">
                  <span className="vp-row-bar-fill" style={{ width: `${o.prob}%` }} />
                </span>
                <span className="vp-row-prob">{o.prob}%</span>
                <span className="vp-row-pts">+{pointsFor(o.prob)}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="vp-options">
          {outcomes.map((o) => (
            <button
              key={o.id}
              type="button"
              className={'vp-option vp-' + o.tone
                + (pick === o.id ? ' is-selected' : '')
                + (locked ? ' is-locked' : '')}
              disabled={locked}
              onClick={() => !locked && setPick(o.id)}
            >
              <div className="vp-option-top">
                {o.flagSrc ? <img className="flag" alt="" src={o.flagSrc} /> : <FieldGlobe />}
                <span className="vp-option-name">{o.label}</span>
                <span className="vp-option-prob">{o.prob}%</span>
              </div>
              <div className="vp-option-reward">+{pointsFor(o.prob)} pts if correct</div>
            </button>
          ))}
        </div>
      )}

      {!locked ? (
        <button
          type="button"
          className={'vp-submit' + (pick ? ' is-ready' : '')}
          disabled={!pick}
          onClick={submit}
        >
          {picked ? `Lock in: ${picked.label}` : (isMulti ? 'Select an outcome' : 'Select a side')}
        </button>
      ) : (
        <div className="vp-locked">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 L9 17 L4 12" />
          </svg>
          Locked in <b>{picked?.label}</b> · pending resolution
        </div>
      )}
    </div>
  )
}

const EVENT_LABEL = { goal: 'GOAL', yellow: 'YEL', red: 'RED', sub: 'SUB', shot: 'SHOT' }
function EventBadge({ type }) {
  return <span className={'ev-badge ev-' + type}>{EVENT_LABEL[type] || type}</span>
}

// Generic placeholder for "Field" / "Yes" / "No" — anything not a country
// Invite button — opens a small modal that surfaces the shareable invite link.
function InviteButton({ tableId }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="room-invite" type="button" onClick={() => setOpen(true)} title="Invite friends to this room">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="20" y1="8" x2="20" y2="14"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
        Invite
      </button>
      {open && <InviteModal tableId={tableId} onClose={() => setOpen(false)} />}
    </>
  )
}

// Modal surfaces the same invite link the Manage panel exposes, with one-click copy.
function InviteModal({ tableId, onClose }) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${tableId}`
    : `https://lokacup.app/r/${tableId}`

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (e) {}
  }

  return createPortal((
    <div className="invite-backdrop" onClick={onClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="invite-close" type="button" aria-label="Close" onClick={onClose}>×</button>

        <div className="invite-head">
          <div className="invite-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h2 className="invite-title">Invite friends to this Table</h2>
          <p className="invite-sub">Anyone with this link can join the room as a guest.</p>
        </div>

        <div className="invite-link-row">
          <code className="invite-link" onFocus={(e) => e.target.select?.()}>{link}</code>
          <button
            type="button"
            className={'invite-copy' + (copied ? ' is-copied' : '')}
            onClick={copy}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="invite-divider"><span>or share via</span></div>

        <div className="invite-share-row">
          <a className="invite-share-btn" target="_blank" rel="noreferrer"
             href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Join my LokaCup table')}&url=${encodeURIComponent(link)}`}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2H21.5l-7.49 8.564L23 22h-6.844l-5.36-7.013L4.66 22H1.4l8.02-9.17L1 2h7.02l4.84 6.4L18.244 2z"/></svg>
            X / Twitter
          </a>
          <a className="invite-share-btn" target="_blank" rel="noreferrer"
             href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join my LokaCup table')}`}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
            Telegram
          </a>
          <button type="button" className="invite-share-btn" onClick={copy} title="Copy link">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy link
          </button>
        </div>
      </div>
    </div>
  ), document.body)
}

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
  const [openManage, setOpenManage] = useState(false)
  // Active analyst agents on this Table — host can add/remove from the Manage modal
  const [activeAgentKeys, setActiveAgentKeys] = useState(
    () => new Set(ANALYSTS.filter((a) => a.defaultActive).map((a) => a.key))
  )
  const toggleAgent = (key) =>
    setActiveAgentKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  const activeAnalysts = ANALYSTS.filter((a) => activeAgentKeys.has(a.key))
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
          {t.status === 'upcoming' && (
            <span className="room-title-upcoming">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
              </svg>
              Kickoff in {t.kickoffIn}
            </span>
          )}
          {t.status === 'finished' && (
            <span className="room-title-finished">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Final · settled {t.settledAgo} ago
            </span>
          )}
        </h1>
        <div className="room-meta">
          <InviteButton tableId={t.id} />
          <button className="room-share" type="button" title="Share this room">
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
            <PredictionRoom
              activeAnalysts={activeAnalysts}
              onOpenAnalyst={(a) => setOpenAnalyst(a)}
              onOpenManage={() => setOpenManage(true)}
            />
          </div>
          {/* Basic data analysis — pitch / match stats / market flow / related markets */}
          <BasicDataTabs market={t.market} pair={pair} />
        </section>

        {/* ── Right rail: match summary + chart on top, chat full below ─ */}
        <aside className="room-rail rail-chat">
          {/* Right rail — content switches by table status */}
          <div className={'room-card insight-card insight-card-' + t.status}>
            {t.status !== 'finished' ? (
              <>
                <div className={'ai-conclusion-hero' + (t.status === 'upcoming' ? ' is-upcoming' : '')}>
                  <span className="ai-conclusion-pill-label">
                    {t.status === 'upcoming' ? 'Pre-match baseline' : 'AI conclusion'}
                  </span>
                  <div className="ai-conclusion-hero-row">
                    {flagA ? <img className="flag" alt="" src={flagA} /> : <FieldGlobe />}
                    <span className="ai-conclusion-hero-side">{pair.a}</span>
                    <span className="ai-conclusion-hero-verb">to win</span>
                    <span className="ai-conclusion-hero-prob">{aiA}%</span>
                  </div>
                  <RailProbCurve aiA={aiA} aiB={aiB} pairA={pair.a} pairB={pair.b} flatten={t.status === 'upcoming'} />
                </div>

                <VotePanel
                  market={t.market}
                  pair={pair}
                  aiA={aiA}
                  aiB={aiB}
                  flagA={flagA}
                  flagB={flagB}
                  FieldGlobe={FieldGlobe}
                />
              </>
            ) : (
              <SettledRail
                table={t}
                pair={pair}
                aiA={aiA}
                aiB={aiB}
                flagA={flagA}
                flagB={flagB}
                FieldGlobe={FieldGlobe}
              />
            )}
          </div>

          {/* Bare-bones stream chat — no card wrapper, no header. */}
          <div className="scc-bare">
            <div className="scc-stream">
              {replies.slice(-8).map((r, i) => {
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
            <div className="scc-input-row">
              <input className="scc-input" placeholder="Say something…" />
              <button className="scc-send">Send</button>
            </div>
          </div>

        </aside>
      </div>

      {openAnalyst && (
        <div className="analyst-modal-backdrop" onClick={() => setOpenAnalyst(null)}>
          <div className="analyst-modal" onClick={(e) => e.stopPropagation()}>
            <button className="analyst-modal-close" onClick={() => setOpenAnalyst(null)} aria-label="Close">×</button>
            <div className="analyst-modal-head">
              <span className={'analyst-avatar large tone-' + openAnalyst.tone} data-key={openAnalyst.key} aria-hidden>
                {openAnalyst.image
                  ? <img className="analyst-avatar-img" src={openAnalyst.image} alt="" />
                  : <span className="analyst-glyph">{openAnalyst.glyph}</span>}
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
                {openAnalyst.key === 'history' && `Pulls H2H records, season form, ELO ratings, and trend lines. Recalibrates the priors after every match outcome.`}
                {openAnalyst.key === 'market' && `Watches Polymarket and Kalshi order flow in real time — surfaces edge when the market lags AI consensus, and flags whale prints.`}
                {openAnalyst.key === 'news' && `Pulls from lineup leaks, injury wires, ref history, and social signals. Quickest to react when external news drops mid-match.`}
                {openAnalyst.key === 'tactics' && `Reads formations, pressing intensity, and momentum shifts on the pitch. Predicts substitutions and tactical adjustments.`}
                {openAnalyst.key === 'diviner' && `Casts hexagrams from the I Ching to read the match — eight trigrams, sixty-four outcomes. Often wrong, occasionally inexplicably right; keeps the table honest about uncertainty.`}
                {openAnalyst.key === 'crowd' && `Aggregates Twitter, Reddit, and Discord chatter — surfaces fan sentiment swings and detects manipulation campaigns.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {openManage && (
        <div className="analyst-modal-backdrop" onClick={() => setOpenManage(false)}>
          <div className="analyst-modal manage-modal" onClick={(e) => e.stopPropagation()}>
            <button className="analyst-modal-close" onClick={() => setOpenManage(false)} aria-label="Close">×</button>
            <div className="analyst-modal-head">
              <div>
                <div className="analyst-modal-name">Manage participants</div>
                <div className="analyst-modal-sub">
                  {activeAnalysts.length} agents · 3 friends · 1 you
                </div>
              </div>
            </div>

            <div className="manage-body">
            {/* AI agents — toggle on/off */}
            <div className="manage-section">
              <div className="manage-section-head">
                <div>
                  <div className="manage-section-title">AI agents</div>
                  <div className="manage-section-sub">Pick which analysts join your debate team</div>
                </div>
                <span className="manage-section-count">{activeAnalysts.length} / {ANALYSTS.length} active</span>
              </div>
              <div className="manage-list">
                {ANALYSTS.map((a) => {
                  const active = activeAgentKeys.has(a.key)
                  return (
                    <div key={a.key} className={'manage-row manage-agent-row' + (active ? ' is-active' : '')}>
                      <span className={'analyst-avatar tone-' + a.tone} data-key={a.key}>
                        {a.image
                          ? <img className="analyst-avatar-img" src={a.image} alt="" />
                          : <span className="analyst-glyph">{a.glyph}</span>}
                      </span>
                      <div className="manage-row-body">
                        <div className="manage-row-name">{a.name}</div>
                        <div className="manage-row-sub">{a.specialty}</div>
                      </div>
                      <button
                        className={'manage-toggle' + (active ? ' is-on' : '')}
                        type="button"
                        onClick={() => toggleAgent(a.key)}
                        aria-pressed={active}
                      >
                        <span className="manage-toggle-knob" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Friends — invite or remove */}
            <div className="manage-section">
              <div className="manage-section-head">
                <div>
                  <div className="manage-section-title">Friends</div>
                  <div className="manage-section-sub">Members of this Table</div>
                </div>
              </div>
              <div className="manage-list">
                {[
                  { initial: 'Y',  label: 'You',       sub: 'Host',          tone: 'me',     removable: false },
                  { initial: 'SK', label: 'Sarah K.',  sub: 'Online · 14m',  tone: 'pink',   removable: true  },
                  { initial: 'AM', label: 'Alex M.',   sub: 'Online · 8m',   tone: 'amber',  removable: true  },
                  { initial: 'JT', label: 'Jordan T.', sub: 'Online · 2m',   tone: 'violet', removable: true  },
                ].map((m) => (
                  <div key={m.label} className={'manage-row tone-' + m.tone + (m.removable ? '' : ' is-host')}>
                    <span className={'friend-pill tone-' + m.tone + (m.tone === 'me' ? ' is-me' : '')}>
                      <span className="friend-initial">{m.initial}</span>
                      <span className="friend-dot" />
                    </span>
                    <div className="manage-row-body">
                      <div className="manage-row-name">{m.label}</div>
                      <div className="manage-row-sub">{m.sub}</div>
                    </div>
                    {m.removable && (
                      <button className="manage-remove" type="button">Remove</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="manage-invite">
                <div className="manage-invite-label">Invite more friends</div>
                <div className="manage-invite-link">
                  <code>https://lokacup.app/r/AKOZ-9F2X</code>
                  <button
                    className="manage-invite-copy"
                    type="button"
                    onClick={() => {
                      try { navigator.clipboard.writeText('https://lokacup.app/r/AKOZ-9F2X') } catch (e) {}
                    }}
                  >Copy</button>
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
