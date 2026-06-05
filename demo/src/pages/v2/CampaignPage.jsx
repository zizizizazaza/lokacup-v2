import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// Prize pool — sourced from docs/points-system.md §4.2
const PRIZE_POOLS = [
  { key: 'finals',  rank: '1st', count: 1, label: 'Final',         pool: 'Top 10', chance: '10%', tone: 'gold'   },
  { key: 'semi',    rank: '2nd', count: 2, label: 'Semifinal',     pool: 'Top 30', chance: '~7%', tone: 'silver' },
  { key: 'quarter', rank: '3rd', count: 2, label: 'Quarter-final', pool: 'Top 50', chance: '~4%', tone: 'bronze' },
]

// Hand-drawn trophy illustrations — one per tier
function TrophyArt({ tone }) {
  const palette = {
    gold:   { stroke: '#d4a017', fill1: '#facc15', fill2: '#fef08a', base: '#a16207', accent: '#fffbeb' },
    silver: { stroke: '#94a3b8', fill1: '#e2e8f0', fill2: '#f8fafc', base: '#64748b', accent: '#ffffff' },
    bronze: { stroke: '#a55a2b', fill1: '#cd7f32', fill2: '#e8a87c', base: '#7c3a14', accent: '#ffe7c8' },
  }[tone]
  return (
    <svg viewBox="0 0 120 150" className="cmp-trophy-art" aria-hidden>
      <defs>
        <linearGradient id={`tg-${tone}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.fill2} />
          <stop offset="50%" stopColor={palette.fill1} />
          <stop offset="100%" stopColor={palette.stroke} />
        </linearGradient>
        <radialGradient id={`shine-${tone}`} cx="35%" cy="25%" r="60%">
          <stop offset="0%" stopColor={palette.accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sparkles around */}
      <g opacity="0.85">
        <circle cx="18" cy="22" r="1.8" fill={palette.fill2} />
        <circle cx="100" cy="38" r="2.2" fill={palette.fill2} />
        <circle cx="14" cy="70" r="1.4" fill={palette.fill2} />
        <circle cx="104" cy="80" r="1.6" fill={palette.fill2} />
      </g>

      {/* Side handles */}
      <path d="M30 50 Q12 50 12 35 Q12 22 30 22"
            fill="none" stroke={palette.stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M90 50 Q108 50 108 35 Q108 22 90 22"
            fill="none" stroke={palette.stroke} strokeWidth="4" strokeLinecap="round" />

      {/* Cup body */}
      <path d="M28 18 L92 18 L86 70 Q60 82 34 70 Z" fill={`url(#tg-${tone})`} stroke={palette.stroke} strokeWidth="2" strokeLinejoin="round" />
      {/* highlight */}
      <ellipse cx="50" cy="38" rx="14" ry="6" fill={`url(#shine-${tone})`} />
      {/* rim band */}
      <rect x="28" y="18" width="64" height="6" fill={palette.stroke} opacity="0.4" />

      {/* Star centerpiece */}
      <path
        d="M60 32 L62.6 39 L70 39 L64 43.7 L66.2 51 L60 46.8 L53.8 51 L56 43.7 L50 39 L57.4 39 Z"
        fill={palette.accent} stroke={palette.stroke} strokeWidth="1" strokeLinejoin="round"
      />

      {/* Stem */}
      <rect x="55" y="75" width="10" height="14" fill={palette.stroke} />
      {/* Base layers */}
      <rect x="42" y="88" width="36" height="9" rx="2" fill={palette.base} />
      <rect x="34" y="96" width="52" height="8" rx="2" fill={palette.stroke} />
      <rect x="28" y="104" width="64" height="6" rx="2" fill={palette.base} opacity="0.85" />

      {/* Ribbon hanging */}
      <path d="M50 110 L46 130 L52 126 L52 110 Z" fill={palette.fill1} stroke={palette.stroke} strokeWidth="1" />
      <path d="M70 110 L74 130 L68 126 L68 110 Z" fill={palette.fill1} stroke={palette.stroke} strokeWidth="1" />
    </svg>
  )
}

// SVG icons for the action cards — line-art, currentColor stroke
function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  )
}
function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  )
}
function IconFriends() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9.5" r="2.5" />
      <path d="M14.5 20c0-2.5 1.8-4.5 5.5-4.5" />
    </svg>
  )
}
function IconCode() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="11.5" r="2" />
      <path d="M5 17c0-1.5 1.8-3 4-3s4 1.5 4 3" />
      <line x1="14.5" y1="9.5" x2="19" y2="9.5" />
      <line x1="14.5" y1="13" x2="19" y2="13" />
      <line x1="14.5" y1="16.5" x2="17.5" y2="16.5" />
    </svg>
  )
}
function IconShare() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5"  r="3" />
      <circle cx="6"  cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6"  y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5"  x2="8.6"  y2="10.5" />
    </svg>
  )
}

// 5 user-facing actions. NO formulas; each has a single CTA to act immediately.
function makeActions(navigate) {
  return [
    {
      Icon: IconTarget,
      tone: 'green',
      title: 'Predict correctly',
      desc: 'Vote inside a Table before resolution. Sharp insight pays more.',
      cta: 'Find a live Table →',
      onClick: () => navigate('/'),
    },
    {
      Icon: IconMic,
      tone: 'cyan',
      title: 'Host a Table',
      desc: 'Stay active, attract spectators. Time and crowd both count.',
      cta: 'Open a Table →',
      onClick: () => navigate('/open'),
    },
    {
      Icon: IconFriends,
      tone: 'amber',
      title: 'Invite friends',
      desc: 'Invite friends to sign up and join a Table.',
      cta: 'Copy invite link',
      onClick: () => {
        try { navigator.clipboard.writeText('https://lokacup.app/r/AKOZ-9F2X') } catch (e) {}
        alert('Invite link copied: https://lokacup.app/r/AKOZ-9F2X')
      },
    },
    {
      Icon: IconShare,
      tone: 'sky',
      title: 'Share to Twitter',
      desc: 'One reward per day. Predictions and Tables both shareable.',
      cta: 'Tweet now →',
      onClick: () => {
        const url = 'https://lokacup.app'
        const text = encodeURIComponent("I'm predicting the World Cup with @LokaCupAI — climbing the leaderboard for real tickets")
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
      },
    },
  ]
}

// Mock leaderboard (50 entries)
const HANDLES = [
  'coachMike', 'AlphaBet', 'EdgeHunter22', 'PolyDegen', 'kalshiKween',
  'lokaWhale', 'VinjrBro', 'SambaScout', 'theTacticGuy', 'midfieldMan',
  'RefHaterX', 'MoroccoStan', 'BotWatch', 'AlphaSeeker', 'StadiumWolf',
  'PressBox', 'OddsHunter', 'NinetiethMin', 'KaiserKid', 'GoalDriven',
  'XGForever', 'PenaltyPal', 'WhaleRider', 'LineupLeak', 'MetricsMan',
  'CornerKick', 'OffsideKing', 'NetBuster', 'TikiTaka', 'CounterAttack',
  'BoxToBox', 'PressTrigger', 'NoLook', 'TopBins', 'Knuckleball',
  'StoppageHero', 'BicycleBoy', 'FootyFan42', 'MidfieldGen', 'LowBlock',
  'GoalGap', 'RoboRef', 'Whistleblower', 'SilverFox', 'GroundFloor',
  'EveryNight', 'OffTheBall', 'CountingCards', 'NumberCruncher', 'YouTheUser',
]
const LEADERBOARD = HANDLES.map((handle, i) => ({
  rank: i + 1,
  handle,
  points: Math.round(8200 * Math.pow(0.94, i) + (i % 7) * 23),
  trend: ['up', 'flat', 'up', 'up', 'down', 'flat', 'up'][i % 7],
}))
const ME = { rank: 137, handle: 'You', points: 482, trend: 'up', isMe: true, toTop50: 73 }

// Live activity ticker — synthetic events that scroll across the page
const TICKER_EVENTS = [
  { who: 'MoroccoStan',   pts: '+85',  action: 'Sharp Insight on Brazil vs Field' },
  { who: 'AlphaBet',      pts: '+120', action: 'won 5-in-a-row predictions' },
  { who: 'EdgeHunter22',  pts: '+45',  action: 'hit 50 viewers on their Table' },
  { who: 'lokaWhale',     pts: '+200', action: 'invited 8 friends this week' },
  { who: 'VinjrBro',      pts: '+62',  action: 'predicted underdog Field correctly' },
  { who: 'kalshiKween',   pts: '+33',  action: 'shared on Twitter' },
  { who: 'SambaScout',    pts: '+150', action: 'overtook Top 20' },
  { who: 'NinetiethMin',  pts: '+90',  action: 'closed a Sharp Insight bonus' },
]

function useCountdown(targetMs) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, targetMs - now)
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  return { days, hours, mins, secs }
}

function LeaderboardRow({ row }) {
  return (
    <div className={
      'cmp-lb-row'
      + (row.isMe ? ' is-me' : '')
      + (row.rank <= 10 ? ' tier-gold' : row.rank <= 30 ? ' tier-silver' : row.rank <= 50 ? ' tier-bronze' : '')
    }>
      <span className="cmp-lb-rank">#{row.rank}</span>
      <span className="cmp-lb-avatar">{row.handle.replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase()}</span>
      <span className="cmp-lb-handle">{row.handle}</span>
      <span className="cmp-lb-points">{row.points.toLocaleString()}<small>pts</small></span>
      <span className={'cmp-lb-trend trend-' + row.trend}>
        {row.trend === 'up' ? '↑' : row.trend === 'down' ? '↓' : '·'}
      </span>
    </div>
  )
}

export default function CampaignPage() {
  const navigate = useNavigate()
  const actions = useMemo(() => makeActions(navigate), [navigate])
  const [view, setView] = useState('top')
  const [tickerIdx, setTickerIdx] = useState(0)

  // Rotate the ticker every 3 seconds
  useEffect(() => {
    const id = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER_EVENTS.length), 3000)
    return () => clearInterval(id)
  }, [])

  // Fake "settlement in 12d 4h 23m" — pretend Q-final settlement is 12 days away
  const settlementTarget = useMemo(() => Date.now() + (12 * 86400000 + 4 * 3600000 + 23 * 60000), [])
  const { days, hours, mins, secs } = useCountdown(settlementTarget)

  // Progress to Top 50: user has 482 pts, Top 50 cutoff (mocked) is 555 pts → 87%
  const top50Cutoff = LEADERBOARD[49].points
  const progressPct = Math.min(100, Math.round((ME.points / top50Cutoff) * 100))

  return (
    <div className="campaign">
      {/* ╔═══════════════════════════════════════════════════════════════╗
          THEATRICAL HERO — Title + Prize Vault + Settlement Countdown
          ╚═══════════════════════════════════════════════════════════════╝ */}
      <header className="cmp-stage">
        {/* decorative shimmer rings */}
        <span className="cmp-stage-glow g1" aria-hidden />
        <span className="cmp-stage-glow g2" aria-hidden />

        <div className="cmp-stage-top">
          <div className="cmp-eyebrow">
            <span className="cmp-pulse" />
            FIFA World Cup 2026 · Active campaign
          </div>
          <div className="cmp-stage-live-counter">
            <span className="cmp-live-dot" />
            <b>1,247</b> playing now
          </div>
        </div>

        <h1 className="cmp-stage-title">
          Join <span className="cmp-title-accent">10 predictions</span>,<br />
          claim a <span className="cmp-title-accent">Final ticket</span>
        </h1>
        <p className="cmp-stage-sub">
          Take part in live predictions. Climb the Top&nbsp;50. <b>We fly five players to the World&nbsp;Cup.</b>
        </p>

        {/* ── Podium of trophies — Final is the centerpiece (taller / wider) ── */}
        <div className="cmp-podium">
          {/* 2nd place on the left */}
          <div className="cmp-trophy cmp-trophy-silver cmp-trophy-side" style={{ animationDelay: '0.12s' }}>
            <div className="cmp-rank-badge">2nd</div>
            <TrophyArt tone="silver" />
            <div className="cmp-trophy-info">
              <div className="cmp-trophy-count">× 2</div>
              <div className="cmp-trophy-label">Semifinal ticket</div>
              <div className="cmp-trophy-meta">
                <span className="cmp-trophy-pool">Top 30 pool</span>
                <span className="cmp-trophy-chance">~7% chance</span>
              </div>
            </div>
          </div>

          {/* 1st place center — biggest */}
          <div className="cmp-trophy cmp-trophy-gold cmp-trophy-center" style={{ animationDelay: '0s' }}>
            <div className="cmp-rank-badge cmp-rank-1">1st</div>
            <TrophyArt tone="gold" />
            <div className="cmp-trophy-info">
              <div className="cmp-trophy-count">× 1</div>
              <div className="cmp-trophy-label">Final ticket</div>
              <div className="cmp-trophy-meta">
                <span className="cmp-trophy-pool">Top 10 pool</span>
                <span className="cmp-trophy-chance">10% chance</span>
              </div>
            </div>
          </div>

          {/* 3rd place on the right */}
          <div className="cmp-trophy cmp-trophy-bronze cmp-trophy-side" style={{ animationDelay: '0.24s' }}>
            <div className="cmp-rank-badge">3rd</div>
            <TrophyArt tone="bronze" />
            <div className="cmp-trophy-info">
              <div className="cmp-trophy-count">× 2</div>
              <div className="cmp-trophy-label">Quarter-final ticket</div>
              <div className="cmp-trophy-meta">
                <span className="cmp-trophy-pool">Top 50 pool</span>
                <span className="cmp-trophy-chance">~4% chance</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Countdown + your status bar ── */}
        <div className="cmp-stage-status">
          <div className="cmp-countdown">
            <div className="cmp-cd-label">Next snapshot · before quarter-finals</div>
            <div className="cmp-cd-clock">
              <div className="cmp-cd-cell"><b>{String(days).padStart(2, '0')}</b><span>days</span></div>
              <div className="cmp-cd-cell"><b>{String(hours).padStart(2, '0')}</b><span>hrs</span></div>
              <div className="cmp-cd-cell"><b>{String(mins).padStart(2, '0')}</b><span>min</span></div>
              <div className="cmp-cd-cell sec"><b>{String(secs).padStart(2, '0')}</b><span>sec</span></div>
            </div>
          </div>

          <div className="cmp-stake">
            <div className="cmp-stake-row">
              <span className="cmp-stake-label">Your rank</span>
              <span className="cmp-stake-rank">#{ME.rank}</span>
            </div>
            <div className="cmp-stake-row">
              <span className="cmp-stake-label">Your points</span>
              <span className="cmp-stake-pts">{ME.points.toLocaleString()}</span>
            </div>
            <div className="cmp-stake-progress">
              <div className="cmp-progress-track">
                <div className="cmp-progress-fill" style={{ width: progressPct + '%' }} />
              </div>
              <div className="cmp-progress-label">
                {ME.toTop50} pts to reach Top 50 · {progressPct}% there
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ╔═══════════════════════════════════════════════════════════════╗
          LIVE ACTIVITY TICKER
          ╚═══════════════════════════════════════════════════════════════╝ */}
      <div className="cmp-ticker">
        <span className="cmp-ticker-label"><span className="cmp-live-dot" /> Live</span>
        <div className="cmp-ticker-feed">
          {TICKER_EVENTS.map((ev, i) => (
            <div
              key={i}
              className={'cmp-ticker-row' + (i === tickerIdx ? ' is-current' : '')}
            >
              <span className="cmp-ticker-who">{ev.who}</span>
              <span className="cmp-ticker-pts">{ev.pts}</span>
              <span className="cmp-ticker-action">{ev.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ╔═══════════════════════════════════════════════════════════════╗
          ACTION CARDS — each with a CTA button
          ╚═══════════════════════════════════════════════════════════════╝ */}
      <section className="cmp-section">
        <div className="cmp-section-head">
          <h2 className="cmp-section-h">⭐ Earn points · act now</h2>
          <span className="cmp-section-note">Tap any card to start earning</span>
        </div>
        <div className="cmp-action-grid">
          {actions.map((a) => (
            <button key={a.title} className={'cmp-action tone-' + a.tone} onClick={a.onClick}>
              <div className="cmp-action-icon"><a.Icon /></div>
              <div className="cmp-action-body">
                <div className="cmp-action-title">{a.title}</div>
                <div className="cmp-action-desc">{a.desc}</div>
              </div>
              <div className="cmp-action-cta">{a.cta}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ╔═══════════════════════════════════════════════════════════════╗
          LEADERBOARD
          ╚═══════════════════════════════════════════════════════════════╝ */}
      <section className="cmp-section cmp-leaderboard">
        <div className="cmp-section-head">
          <h2 className="cmp-section-h">🏅 Leaderboard</h2>
          <div className="cmp-tabs">
            <button className={'cmp-tab' + (view === 'top' ? ' is-on' : '')}  onClick={() => setView('top')}>Top 50</button>
            <button className={'cmp-tab' + (view === 'near' ? ' is-on' : '')} onClick={() => setView('near')}>Your area</button>
          </div>
        </div>

        <div className="cmp-me-row">
          <LeaderboardRow row={ME} />
        </div>

        <div className="cmp-lb-list">
          {LEADERBOARD.map((row) => <LeaderboardRow key={row.rank} row={row} />)}
        </div>
      </section>

      {/* ╔═══════════════════════════════════════════════════════════════╗
          SETU AIRDROP FOOTER
          ╚═══════════════════════════════════════════════════════════════╝ */}
      <footer className="cmp-airdrop">
        <div className="cmp-airdrop-icon">🪂</div>
        <div className="cmp-airdrop-body">
          <h3>Every point also counts toward the Setu airdrop</h3>
          <p>
            Even if you don't make Top 50 this season, all points you earn here become your Setu
            allocation when the snapshot is taken. Predict, host, share — every minute compounds.
          </p>
        </div>
      </footer>
    </div>
  )
}
