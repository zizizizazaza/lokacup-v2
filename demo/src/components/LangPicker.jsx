import { useEffect, useRef, useState } from 'react'

// Supported languages. `flag` is a regional indicator emoji pair.
const LANGS = [
  { code: 'en', name: 'English',    native: 'English',    flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese',    native: '中文',        flag: '🇨🇳' },
  { code: 'ko', name: 'Korean',     native: '한국어',       flag: '🇰🇷' },
  { code: 'es', name: 'Spanish',    native: 'Español',     flag: '🇪🇸' },
  { code: 'fr', name: 'French',     native: 'Français',    flag: '🇫🇷' },
  { code: 'ru', name: 'Russian',    native: 'Русский',     flag: '🇷🇺' },
]

const STORAGE_KEY = 'lokacup:lang'

function readSaved() {
  if (typeof window === 'undefined') return 'en'
  try { return window.localStorage.getItem(STORAGE_KEY) || 'en' } catch (e) { return 'en' }
}

export default function LangPicker() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState(() => readSaved())
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const select = (c) => {
    setCode(c)
    setOpen(false)
    try { window.localStorage.setItem(STORAGE_KEY, c) } catch (e) {}
    document.documentElement.setAttribute('lang', c)
  }

  const current = LANGS.find((l) => l.code === code) || LANGS[0]

  return (
    <div className="lang-picker" ref={ref}>
      <button
        type="button"
        className={'lang-trigger' + (open ? ' is-open' : '')}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Change language"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </svg>
        <span className="lang-trigger-code">{current.code.toUpperCase()}</span>
        <svg className={'lang-trigger-chev' + (open ? ' is-open' : '')} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className="lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === code}
                className={'lang-option' + (l.code === code ? ' is-active' : '')}
                onClick={() => select(l.code)}
              >
                <span className="lang-option-flag" aria-hidden>{l.flag}</span>
                <span className="lang-option-native">{l.native}</span>
                <span className="lang-option-name">{l.name}</span>
                {l.code === code && (
                  <svg className="lang-option-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
