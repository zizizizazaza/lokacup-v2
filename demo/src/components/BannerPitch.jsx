import { useEffect, useRef, useState } from 'react'

const AGENTS = [
  { tone: 'lime',  name: 'Stats Agent',   anchor: { x: 0.62, y: 0.22 } },
  { tone: 'gold',  name: 'Odds Agent',    anchor: { x: 0.84, y: 0.30 } },
  { tone: 'coral', name: 'News Agent',    anchor: { x: 0.62, y: 0.74 } },
  { tone: 'cyan',  name: 'Tactics Agent', anchor: { x: 0.84, y: 0.72 } },
]

function Bot({ tone }) {
  return (
    <span className={'bot-head tone-' + tone}>
      <span className="bot-eye left" />
      <span className="bot-eye right" />
      <span className="bot-antenna" />
    </span>
  )
}

function Ball() {
  return (
    <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden>
      <circle cx="16" cy="16" r="14.5" fill="#fff" stroke="#0a0a0a" strokeWidth="1.6" />
      <polygon points="16,11 20.76,14.45 18.94,20.04 13.06,20.04 11.24,14.45" fill="#0a0a0a" />
      <line x1="16" y1="11" x2="16" y2="3" stroke="#0a0a0a" strokeWidth="1.4" />
      <line x1="20.76" y1="14.45" x2="28.5" y2="11.5" stroke="#0a0a0a" strokeWidth="1.4" />
      <line x1="18.94" y1="20.04" x2="23.5" y2="27.5" stroke="#0a0a0a" strokeWidth="1.4" />
      <line x1="13.06" y1="20.04" x2="8.5" y2="27.5" stroke="#0a0a0a" strokeWidth="1.4" />
      <line x1="11.24" y1="14.45" x2="3.5" y2="11.5" stroke="#0a0a0a" strokeWidth="1.4" />
    </svg>
  )
}

function PlayerCursor() {
  // Same head as the agents but without the antenna — gives it a "you're one of them" vibe
  return (
    <span className="pc-body">
      <span className="bot-head tone-lime">
        <span className="bot-eye left" />
        <span className="bot-eye right" />
      </span>
    </span>
  )
}

export default function BannerPitch() {
  const pitchRef = useRef(null)
  const ballRef = useRef({ x: 0.5, y: 0.5, vx: 0.0035, vy: 0.0025 })
  const cursorRef = useRef({ x: 0, y: 0, in: false })
  const ballElRef = useRef(null)
  const playerElRef = useRef(null)
  const [active, setActive] = useState(false)

  // physics loop
  useEffect(() => {
    let raf
    const tick = () => {
      const el = pitchRef.current
      const rect = el ? el.getBoundingClientRect() : { width: 0, height: 0 }
      const b = ballRef.current
      b.x += b.vx
      b.y += b.vy
      // friction
      b.vx *= 0.991
      b.vy *= 0.991
      // bounce off bounds (right area only; left is "out"-ish but allowed)
      if (b.x < 0.02) { b.x = 0.02; b.vx = Math.abs(b.vx) * 0.75 }
      if (b.x > 0.98) { b.x = 0.98; b.vx = -Math.abs(b.vx) * 0.75 }
      if (b.y < 0.06) { b.y = 0.06; b.vy = Math.abs(b.vy) * 0.75 }
      if (b.y > 0.94) { b.y = 0.94; b.vy = -Math.abs(b.vy) * 0.75 }

      // bot collisions: if too close, kick ball away from bot
      for (const a of AGENTS) {
        const dx = b.x - a.anchor.x
        const dy = b.y - a.anchor.y
        const d2 = dx * dx + dy * dy
        if (d2 < 0.0045) {
          const d = Math.sqrt(d2) || 0.001
          const speed = 0.0055 + Math.random() * 0.003
          b.vx = (dx / d) * speed + (Math.random() - 0.5) * 0.0015
          b.vy = (dy / d) * speed + (Math.random() - 0.5) * 0.0015
        }
      }

      // anti-stall: if ball is too slow, a random bot "runs in" and kicks it
      // toward themselves. The ball travels toward the bot, hits it, and gets
      // bounced away by the collision logic above — net: it stays in play.
      const spd2 = b.vx * b.vx + b.vy * b.vy
      if (spd2 < 0.0000035) {
        const a = AGENTS[Math.floor(Math.random() * AGENTS.length)]
        const dx = a.anchor.x - b.x
        const dy = a.anchor.y - b.y
        const d = Math.sqrt(dx * dx + dy * dy) || 0.001
        b.vx = (dx / d) * 0.012
        b.vy = (dy / d) * 0.012
      }

      // commit to DOM (px-based so it works without container queries)
      const be = ballElRef.current
      if (be && rect.width) {
        const px = b.x * rect.width - 10  // half of 20px ball
        const py = b.y * rect.height - 10
        be.style.transform = `translate(${px}px, ${py}px)`
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // mouse tracking — drive the player cursor by transform
  const onMove = (e) => {
    const el = pitchRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    cursorRef.current = { x, y, in: true }
    if (playerElRef.current) {
      // Position the player so its center sits on the cursor
      const px = e.clientX - rect.left - 17  // half of 34px
      const py = e.clientY - rect.top - 17
      playerElRef.current.style.transform = `translate(${px}px, ${py}px)`
    }
  }
  const onEnter = () => setActive(true)
  const onLeave = () => { setActive(false); cursorRef.current.in = false }

  const onClick = (e) => {
    const el = pitchRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const b = ballRef.current
    const dx = b.x - x
    const dy = b.y - y
    const d = Math.sqrt(dx * dx + dy * dy)
    // Kick within ~20% of the ball, direction from cursor → ball, constant speed
    if (d < 0.22 && d > 0.0001) {
      const speed = 0.026
      b.vx = (dx / d) * speed
      b.vy = (dy / d) * speed
    }
  }

  return (
    <div
      ref={pitchRef}
      className={'banner-pitch' + (active ? ' active' : '')}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {AGENTS.map((a, i) => (
        <span
          key={a.name}
          className={'banner-bot tone-' + a.tone}
          style={{ left: a.anchor.x * 100 + '%', top: a.anchor.y * 100 + '%' }}
        >
          <span className={'bot-drift drift-' + i}>
            <Bot tone={a.tone} />
            <span className="bot-name">{a.name}</span>
          </span>
        </span>
      ))}
      <span ref={ballElRef} className="banner-ball">
        <Ball />
      </span>
      <span ref={playerElRef} className="player-cursor" aria-hidden>
        <PlayerCursor />
      </span>
    </div>
  )
}
