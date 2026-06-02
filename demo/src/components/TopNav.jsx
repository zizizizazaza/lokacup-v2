import { NavLink, Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
]

function LangSwitcher() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('en')
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const active = LANGS.find((l) => l.code === current)

  return (
    <div className="lang-switcher" ref={ref}>
      <button className="lang-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="lang-globe" aria-hidden="true">🌐</span>
        <span className="lang-current">{active.label}</span>
        <span className="lang-caret">▾</span>
      </button>
      {open && (
        <div className="lang-menu" role="menu">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={'lang-option' + (l.code === current ? ' active' : '')}
              onClick={() => { setCurrent(l.code); setOpen(false) }}
            >
              {l.label}
              {l.code === current && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={'top-nav' + (scrolled ? ' scrolled' : '')}>
      <div className="top-nav-inner">
        <Link to="/" className="nav-brand">LokaCup</Link>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Ask
          </NavLink>
          <NavLink to="/matches" className={({ isActive }) => 'nav-link nav-link-live' + (isActive ? ' active' : '')}>
            <span className="live-dot" aria-hidden="true" />
            Live
          </NavLink>
          <NavLink to="/strategies" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Strategies
          </NavLink>
        </div>
        <div className="nav-right">
          <LangSwitcher />
          <div className="nav-cta">Sign in</div>
        </div>
      </div>
    </nav>
  )
}
