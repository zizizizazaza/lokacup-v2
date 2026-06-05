import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ANALYSTS } from '../data/analysts.js'
import { useAuth, isImageAvatar, avatarGlyph } from '../lib/auth.js'

// Shared celebration modal — used by both the live Table detail page (after a
// match settles) and the Profile "My predictions" cards (any status).
//
// Props:
//   status: 'won' | 'lost' | 'pending'
//   table, winningLabel, flag, myPickLabel, pts
//   onClose
//
// For 'pending' predictions there's no winner yet, so we treat the user's pick
// as the featured side and skip the points payout / confetti.
export default function WinShareModal({ table, winningLabel, flag, myPickLabel, pts, status, onClose }) {
  const { user } = useAuth()
  const displayName = user?.name || 'You'
  const handle = user?.handle
    || (user?.email && `@${user.email.split('@')[0]}`)
    || (user?.address && `${user.address.slice(0, 6)}…${user.address.slice(-4)}`)
    || ''
  const userIsImg = isImageAvatar(user?.avatar)
  const userGlyph = avatarGlyph(user || { name: displayName })

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

  const won = status === 'won'
  const lost = status === 'lost'
  const pending = status === 'pending'

  // Confetti only on a confirmed win — keep losses + pendings quiet
  const particles = won ? Array.from({ length: 80 }, (_, i) => ({
    left: (i * 1.27) % 100,
    delay: (i % 12) * 0.18,
    dur: 2.6 + ((i * 7) % 18) / 10,
    color: ['#a8ff00','#ffae4d','#ff79c6','#7cf8ff','#facc15','#ff6b6b'][i % 6],
    tilt: ((i * 23) % 90) - 45,
    size: 6 + (i % 4) * 2,
  })) : []

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/table/${table.id}?w=1`
    : `https://lokacup.app/table/${table.id}`
  const tweetText = won
    ? `Called it. ${winningLabel} won — I picked ${myPickLabel} with my AI team on LokaCup. +${pts} pts 🏆`
    : lost
      ? `Tough one. ${winningLabel} took it. Run it back on LokaCup with the AI team.`
      : `Locked in: ${myPickLabel}. My AI team and I are watching this one closely on LokaCup.`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(link)}`

  // Featured side label depends on status: for pending we feature the user's pick
  const featuredLabel = pending ? myPickLabel : winningLabel
  const headlineLines = won
    ? <>I called it. <br/>With my AI team.</>
    : lost
      ? <>I made my call. <br/>The cup keeps going.</>
      : <>I'm locked in. <br/>Let the AI cook.</>
  const badgeText = won ? '🏆 SHARP CALL' : lost ? '— BETTER LUCK NEXT —' : '⏳ LOCKED IN'

  return createPortal((
    <div className="win-backdrop" onClick={onClose}>
      {won && (
        <div className="win-confetti" aria-hidden>
          {particles.map((p, i) => (
            <span
              key={i}
              className="win-confetti-piece"
              style={{
                left: p.left + '%',
                animationDelay: p.delay + 's',
                animationDuration: p.dur + 's',
                background: p.color,
                transform: `rotate(${p.tilt}deg)`,
                width: p.size + 'px',
                height: (p.size * 1.6) + 'px',
              }}
            />
          ))}
        </div>
      )}

      <div className="win-modal" onClick={(e) => e.stopPropagation()}>
        <button className="win-close" type="button" aria-label="Close" onClick={onClose}>×</button>

        <div className={'win-poster ' + (won ? 'is-win' : lost ? 'is-loss' : 'is-pending')}>
          <div className="win-poster-grid" aria-hidden />
          <div className="win-poster-glow" aria-hidden />

          <div className="win-poster-top">
            <span className="win-poster-brand">LokaCup</span>
            <span className="win-poster-badge">{badgeText}</span>
          </div>

          <div className="win-poster-quote">{headlineLines}</div>

          <div className="win-poster-mid">
            {flag && <img className="win-poster-flag" alt="" src={flag} />}
            <div className="win-poster-mid-text">
              <div className="win-poster-result">{featuredLabel}</div>
              <div className="win-poster-q">{table.market.title}</div>
            </div>
          </div>

          <div className="win-poster-stats">
            <div className="win-poster-stat">
              <div className="win-poster-stat-val">{won ? `+${pts}` : pending ? `+${pts}` : '—'}</div>
              <div className="win-poster-stat-lbl">{won ? 'pts earned' : pending ? 'pts at stake' : 'pts'}</div>
            </div>
            <div className="win-poster-stat">
              <div className="win-poster-stat-val">{myPickLabel}</div>
              <div className="win-poster-stat-lbl">my pick</div>
            </div>
            <div className="win-poster-stat">
              <div className="win-poster-stat-val">6</div>
              <div className="win-poster-stat-lbl">AI analysts</div>
            </div>
          </div>

          <div className="win-poster-credit">
            <span className={'win-poster-user-avatar' + (userIsImg ? ' is-img' : '')}>
              {userIsImg ? <img src={user.avatar} alt="" /> : userGlyph}
            </span>
            <div className="win-poster-credit-text">
              <div className="win-poster-credit-name">{displayName}</div>
              {handle && <div className="win-poster-credit-handle">{handle}</div>}
            </div>
            <span className="win-poster-credit-with">+ my AI team</span>
          </div>

          <div className="win-poster-agents">
            {ANALYSTS.slice(0, 6).map((a) => (
              <span key={a.key} className={'win-poster-agent tone-' + a.tone}>
                {a.image
                  ? <img src={a.image} alt="" />
                  : <span className="win-poster-agent-glyph">{a.glyph}</span>}
              </span>
            ))}
          </div>

          <div className="win-poster-foot">
            <span>predict with AI · lokacup.app</span>
            <span className="win-poster-hashtag">#LokaCup</span>
          </div>
        </div>

        <div className="win-actions win-actions-2">
          <a className="win-action win-action-x" target="_blank" rel="noreferrer" href={tweetUrl}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2H21.5l-7.49 8.564L23 22h-6.844l-5.36-7.013L4.66 22H1.4l8.02-9.17L1 2h7.02l4.84 6.4L18.244 2z"/></svg>
            Share to X
          </a>
          <button type="button" className="win-action" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Save image
          </button>
        </div>
      </div>
    </div>
  ), document.body)
}
