import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flagSrc } from './Flag.jsx'
import { ANALYSTS } from '../data/analysts.js'

const SLIDES = ['campaign', 'team', 'live']
const ROTATE_MS = 7000

function FinalTicket() {
  return (
    <div className="ch-ticket" aria-hidden>
      <svg viewBox="0 0 280 380" width="280" height="380" className="ticket-svg">
        <defs>
          <linearGradient id="ticketBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1c" />
            <stop offset="100%" stopColor="#0d0d0f" />
          </linearGradient>
          <linearGradient id="ticketAccent" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d91c1c" />
            <stop offset="100%" stopColor="#9a1010" />
          </linearGradient>
          <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor="rgba(255,255,255,0)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <clipPath id="ticketShape">
            <path d="
              M 20 0
              H 260
              A 12 12 0 0 1 272 12
              V 180
              A 10 10 0 0 0 282 190
              A 10 10 0 0 0 272 200
              V 368
              A 12 12 0 0 1 260 380
              H 20
              A 12 12 0 0 1 8 368
              V 200
              A 10 10 0 0 0 -2 190
              A 10 10 0 0 0 8 180
              V 12
              A 12 12 0 0 1 20 0
              Z
            " />
          </clipPath>
        </defs>

        {/* main ticket body */}
        <g clipPath="url(#ticketShape)">
          <rect x="0" y="0" width="280" height="380" fill="url(#ticketBody)" />

          {/* red accent header strip */}
          <rect x="0" y="0" width="280" height="80" fill="url(#ticketAccent)" />
          {/* subtle scanlines */}
          <g opacity="0.07">
            {Array.from({ length: 80 }).map((_, i) => (
              <line key={i} x1="0" x2="280" y1={i * 5} y2={i * 5} stroke="#fff" strokeWidth="0.4" />
            ))}
          </g>

          {/* perforation row */}
          <g fill="rgba(255,255,255,0.18)">
            {Array.from({ length: 14 }).map((_, i) => (
              <circle key={i} cx={20 + i * 18} cy="190" r="1.6" />
            ))}
          </g>
          <line x1="14" x2="266" y1="190" y2="190" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />

          {/* header text */}
          <text x="24" y="32" fill="#fff" fontFamily="var(--font-ui)" fontSize="10" fontWeight="700" letterSpacing="2.2">
            WORLD CUP '26 · FINAL
          </text>
          <text x="24" y="68" fill="#fff" fontFamily="var(--font-display)" fontSize="32" letterSpacing="1.5">
            FINAL TICKET
          </text>

          {/* trophy mark */}
          <g transform="translate(220, 30)" fill="rgba(255,255,255,0.85)">
            <path d="M 4 4 L 28 4 L 28 14 Q 28 22 16 22 Q 4 22 4 14 Z" stroke="#fff" strokeWidth="1.5" fill="none" />
            <rect x="0" y="14" width="4" height="6" fill="#fff" />
            <rect x="28" y="14" width="4" height="6" fill="#fff" />
            <rect x="12" y="22" width="8" height="6" fill="#fff" />
            <rect x="6" y="28" width="20" height="4" fill="#fff" />
          </g>

          {/* labels */}
          <text x="24" y="116" fill="#9a9a9e" fontFamily="var(--font-ui)" fontSize="9" letterSpacing="1.6" fontWeight="600">
            DATE
          </text>
          <text x="24" y="138" fill="#fff" fontFamily="var(--font-display)" fontSize="18" letterSpacing="0.8">
            JUL 19, 2026
          </text>

          <text x="24" y="166" fill="#9a9a9e" fontFamily="var(--font-ui)" fontSize="9" letterSpacing="1.6" fontWeight="600">
            VENUE
          </text>
          <text x="155" y="166" fill="#9a9a9e" fontFamily="var(--font-ui)" fontSize="9" letterSpacing="1.6" fontWeight="600">
            SEAT
          </text>

          <text x="24" y="184" fill="#fff" fontFamily="var(--font-ui)" fontSize="13" fontWeight="700">
            MetLife · NYC
          </text>
          <text x="155" y="184" fill="#fff" fontFamily="var(--font-data)" fontSize="13" fontWeight="700">
            A-104 · 27
          </text>

          {/* bottom stub */}
          <text x="24" y="222" fill="#9a9a9e" fontFamily="var(--font-ui)" fontSize="9" letterSpacing="1.6" fontWeight="600">
            HOLDER
          </text>
          <text x="24" y="242" fill="#fff" fontFamily="var(--font-data)" fontSize="14" fontWeight="700" letterSpacing="0.5">
            0xa1c3…b27e
          </text>

          {/* barcode */}
          <g transform="translate(24, 268)">
            {[3,1,2,4,1,3,2,1,4,2,3,1,2,3,1,2,4,1,2,3,1,4,2,1,3,2,4,1,2,3,1,2].map((w, i, arr) => {
              const x = arr.slice(0, i).reduce((s, v) => s + v + 1.5, 0)
              return <rect key={i} x={x} y={0} width={w} height={42} fill="#fff" />
            })}
          </g>

          {/* shimmer sweep — animated diagonal */}
          <rect className="ticket-shimmer" x="-40" y="0" width="60" height="380" fill="url(#shimmerGrad)" />

          {/* serial */}
          <text x="24" y="332" fill="#9a9a9e" fontFamily="var(--font-data)" fontSize="9" letterSpacing="1.4" fontWeight="600">
            S/N
          </text>
          <text x="24" y="350" fill="#fff" fontFamily="var(--font-data)" fontSize="11" letterSpacing="0.8" fontWeight="700">
            LKC-26-FNL-001827
          </text>
          <text x="200" y="350" fill="var(--accent-red)" fontFamily="var(--font-ui)" fontSize="9" letterSpacing="1.4" fontWeight="700">
            UNCLAIMED
          </text>
        </g>

        {/* ticket outline */}
        <path d="
          M 20 1 H 260 A 11 11 0 0 1 271 12 V 180
          A 10 10 0 0 0 281 190 A 10 10 0 0 0 271 200 V 368
          A 11 11 0 0 1 260 379 H 20 A 11 11 0 0 1 9 368
          V 200 A 10 10 0 0 0 -1 190 A 10 10 0 0 0 9 180 V 12 A 11 11 0 0 1 20 1 Z"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}

function CampaignSlide({ active, navigate }) {
  return (
    <div className={'hc-slide hc-campaign' + (active ? ' active' : '')}>
      <div className="hc-bg-campaign" />
      <div className="hc-overlay" />
      <FinalTicket />
      <div className="ch-content">
        <div className="ch-eyebrow">
          <span className="ch-eyebrow-dot" />
          Limited campaign · World Cup '26
        </div>
        <h1 className="ch-title">
          Join <span className="accent">10 predictions</span>,<br />
          claim a <span className="accent">Final ticket</span>
        </h1>
        <p className="ch-sub">
          Take part in 10 live predictions. We fly the rest to the Final.
        </p>
        <div className="ch-ctas">
          <button className="ch-cta ch-cta-primary" onClick={() => navigate('/open')}>
            <span className="ch-cta-icon">▶</span>
            Join campaign
          </button>
          <button className="ch-cta ch-cta-ghost">See full rules</button>
        </div>

        <div className="ch-stats">
          <div className="ch-stat">
            <div className="ch-stat-val">2,431</div>
            <div className="ch-stat-lbl">Entries so far</div>
          </div>
          <div className="ch-stat">
            <div className="ch-stat-val">18</div>
            <div className="ch-stat-lbl">Final tickets claimed</div>
          </div>
          <div className="ch-stat">
            <div className="ch-stat-val">12 d</div>
            <div className="ch-stat-lbl">Until first draw</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LiveSlide({ active, navigate }) {
  // Mock current featured live match
  const home = { code: 'BRA', name: 'Brazil',  flag: 'br', score: 2 }
  const away = { code: 'DEU', name: 'Germany', flag: 'de', score: 1 }
  const tip = "Brazil leads — AI sees 61% win prob vs market 56%."

  return (
    <div className={'hc-slide hc-live' + (active ? ' active' : '')}>
      <video
        className="hc-video"
        autoPlay muted loop playsInline
        poster="https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1920"
      >
        <source src="https://assets.mixkit.co/videos/43499/43499-720.mp4" type="video/mp4" />
        <source src="https://assets.mixkit.co/videos/43482/43482-720.mp4" type="video/mp4" />
      </video>
      <div className="hc-overlay" />

      <div className="hcl-badge">
        <span className="hcl-dot" />
        Live now · Quarter-final · 67′
      </div>

      <div className="hc-live-content">
        <div className="hcl-match">
          <div className="hcl-team">
            <img className="flag" alt="" src={`https://flagcdn.com/w80/${home.flag}.png`} />
            <div className="hcl-team-name">{home.code}</div>
          </div>
          <div className="hcl-score">{home.score}<span className="hcl-dash">—</span>{away.score}</div>
          <div className="hcl-team">
            <img className="flag" alt="" src={`https://flagcdn.com/w80/${away.flag}.png`} />
            <div className="hcl-team-name">{away.code}</div>
          </div>
        </div>

        <div className="hcl-tip">{tip}</div>

        <button className="hcl-enter" onClick={() => navigate('/table/bra-mar-winner')}>
          Enter table
          <span className="hcl-enter-arrow">→</span>
        </button>
      </div>
    </div>
  )
}

// Labels positioned in SOURCE pixel space (photo is 1392×736).
// Both <image> and labels share the same SVG viewBox, so they scale together.
// Coordinates re-measured from /public/team-banner.jpg.
const SRC_W = 1392
const SRC_H = 736
const TEAM_LABELS = [
  { x:  362, y: 290, name: 'Tarot Diviner',    tone: 'violet' },
  { x:  501, y: 245, name: 'News Analyst',     tone: 'coral'  },
  { x:  613, y: 228, name: 'Tactics Analyst',  tone: 'cyan'   },
  { x:  814, y: 228, name: 'History Analyst',  tone: 'mint'   },
  { x:  940, y: 250, name: 'Market Sentiment', tone: 'gold'   },
  { x: 1058, y: 285, name: 'I Ching Diviner',  tone: 'amber'  },
]
const LABEL_W = 230
const LABEL_H = 56
const LABEL_GAP = 110 // pixels above the head where the label sits

function TeamSlide({ active, navigate }) {
  return (
    <div className={'hc-slide hc-team' + (active ? ' active' : '')}>
      <div className="hc-team-image-wrap" aria-hidden>
        {/* Single SVG holds the image AND labels — both share the source pixel space.
            Cropping is handled by preserveAspectRatio="slice" (equivalent to object-fit: cover);
            label positions are tied to head pixels and scale identically with the image. */}
        <svg
          className="hc-team-svg"
          viewBox={`0 0 ${SRC_W} ${SRC_H}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <image href="/team-banner.jpg" width={SRC_W} height={SRC_H} />

          {/* Soft spotlight haloes radiating from each figure's head */}
          {TEAM_LABELS.map((l, i) => (
            <circle
              key={'halo-' + l.name}
              className={'hc-team-halo tone-' + l.tone}
              cx={l.x}
              cy={l.y + 10}
              r="90"
              style={{ animationDelay: i * 0.35 + 's' }}
            />
          ))}

          {/* Role labels */}
          {TEAM_LABELS.map((l, i) => {
            const top = l.y - LABEL_GAP
            return (
              <foreignObject
                key={l.name}
                x={l.x - LABEL_W / 2}
                y={top}
                width={LABEL_W}
                height={LABEL_H}
                className="hc-team-label-wrap"
                style={{ animationDelay: i * 0.12 + 's' }}
              >
                <div className={'hc-team-label tone-' + l.tone}>{l.name}</div>
              </foreignObject>
            )
          })}
        </svg>
      </div>
      <div className="hc-team-gradient" aria-hidden />

      <div className="hc-team-content">
        <div className="hc-team-headline">
          <h1 className="hc-team-title">
            Predict &amp; analyze<br />
            with your <span className="accent">AI team</span>
          </h1>
          <p className="hc-team-sub">
            Six specialists debate every match in real time.<br />
            Pick who joins your Table.
          </p>
        </div>

        <div className="hc-team-ctas">
          <button className="ch-cta ch-cta-primary" onClick={() => navigate('/open')}>
            <span className="ch-cta-icon">▶</span>
            Start analysis
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const navigate = useNavigate()
  const tRef = useRef(null)

  useEffect(() => {
    if (paused) return
    tRef.current = setTimeout(() => setIdx((i) => (i + 1) % SLIDES.length), ROTATE_MS)
    return () => clearTimeout(tRef.current)
  }, [idx, paused])

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <CampaignSlide active={SLIDES[idx] === 'campaign'} navigate={navigate} />
      <LiveSlide     active={SLIDES[idx] === 'live'}     navigate={navigate} />
      <TeamSlide     active={SLIDES[idx] === 'team'}     navigate={navigate} />

      <div className="hc-dots">
        {SLIDES.map((s, i) => {
          const label = s === 'campaign' ? 'Campaign'
                      : s === 'live'     ? 'Live broadcast'
                      : 'AI team'
          return (
            <button
              key={s}
              className={'hc-dot' + (i === idx ? ' active' : '')}
              onClick={() => setIdx(i)}
              aria-label={`Show ${label} slide`}
            >
              <span className="hc-dot-label">{label}</span>
              <span className={'hc-dot-bar' + (i === idx && !paused ? ' running' : '')} />
            </button>
          )
        })}
      </div>

      {paused && <span className="hc-paused">Paused on hover</span>}
    </section>
  )
}
