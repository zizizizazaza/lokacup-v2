import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const QUICK_LINKS = [
  { label: 'World Cup winner 2026', url: 'polymarket.com/event/world-cup-winner-2026' },
  { label: 'Golden Boot', url: 'kalshi.com/markets/soccer/wc26-golden-boot' },
  { label: 'Argentina group stage', url: 'polymarket.com/event/argentina-stage-elimination' },
]

// Real match-action soccer videos from Mixkit (multi-player, competitive)
const VIDEO_SOURCES = [
  'https://assets.mixkit.co/videos/43499/43499-720.mp4',  // team play to goal — attacker vs defender
  'https://assets.mixkit.co/videos/43482/43482-720.mp4',  // semi-pro match, players competing
  'https://assets.mixkit.co/videos/43485/43485-720.mp4',  // night match, grass-level action
]
const VIDEO_POSTER = 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1920'

export default function Hero() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const submit = (q) => {
    const query = q ?? value
    if (!query) return
    navigate('/analysis/demo', { state: { query } })
  }

  return (
    <section className="hero-full">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster={VIDEO_POSTER}
      >
        {VIDEO_SOURCES.map((src) => <source key={src} src={src} type="video/mp4" />)}
      </video>
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-title">World Cup AI Prediction</h1>
        <p className="tagline">
          Paste a Polymarket or Kalshi link, or ask in plain English. Get a multi-agent analysis in seconds.
        </p>

        <div className="input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Ask anything about the World Cup, or paste a market link"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button className="btn-primary" onClick={() => submit()}><span className="btn-icon">▶</span> Analyze</button>
        </div>

        <div className="quick-links">
          {QUICK_LINKS.map((l) => (
            <a key={l.url} className="quick-link" onClick={(e) => { e.preventDefault(); submit(l.url) }} href="#">
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <a href="#main" className="scroll-cue" aria-label="Scroll down">
        <svg width="20" height="32" viewBox="0 0 20 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 4v22M3 19l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  )
}
