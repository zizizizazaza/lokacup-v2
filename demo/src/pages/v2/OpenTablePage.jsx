import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ANALYSTS } from '../../data/analysts.js'

const LANGS = [
  { code: 'en', name: 'English',    native: 'English',    flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese',    native: '中文',        flag: '🇨🇳' },
  { code: 'ko', name: 'Korean',     native: '한국어',       flag: '🇰🇷' },
  { code: 'es', name: 'Spanish',    native: 'Español',     flag: '🇪🇸' },
  { code: 'fr', name: 'French',     native: 'Français',    flag: '🇫🇷' },
  { code: 'ru', name: 'Russian',    native: 'Русский',     flag: '🇷🇺' },
]

const SAMPLE_QUESTIONS = [
  'Who wins this match?',
  'Total goals — Over 2.5?',
  'Both teams to score?',
  'Will there be a red card?',
  'Who scores the first goal?',
]

export default function OpenTablePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1 — analyst lineup
  const [activeAgentKeys, setActiveAgentKeys] = useState(
    () => new Set(ANALYSTS.filter((a) => a.defaultActive).map((a) => a.key))
  )
  const toggleAgent = (key) =>
    setActiveAgentKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  const activeCount = activeAgentKeys.size

  // Step 2 — configuration
  const [topicMode, setTopicMode] = useState('link') // 'link' | 'custom'
  const [marketUrl, setMarketUrl] = useState('')
  const [question, setQuestion]   = useState('')
  const [options, setOptions]     = useState(['', ''])
  const [lang, setLang]           = useState('en')

  const setOptionAt = (i, v) => setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)))
  const addOption = () => setOptions((prev) => (prev.length >= 6 ? prev : [...prev, '']))
  const removeOption = (i) => setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)))

  const validCustom = question.trim() && options.filter((o) => o.trim()).length >= 2
  const canProceed = activeCount >= 2 // need at least 2 analysts to debate
  const canSubmit  = canProceed && (topicMode === 'link' ? marketUrl.trim() : validCustom)

  const submit = () => {
    if (!canSubmit) return
    // In real build this would POST a table config. For demo: route to a live table.
    navigate('/table/fra-can-mbappe')
  }

  const close = () => navigate(-1)

  // Close on Escape; lock body scroll while open
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate(-1) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [navigate])

  return createPortal((
    <div className="open-modal-backdrop" onClick={close}>
      <div className="open-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button
          className="open-modal-close"
          type="button"
          aria-label="Close"
          onClick={close}
        >×</button>
        {/* Stepper header */}
        <div className="ow-stepper">
          <div className={'ow-step' + (step >= 1 ? ' is-done' : '')}>
            <span className="ow-step-num">{step > 1 ? '✓' : '1'}</span>
            <span className="ow-step-label">Pick analysts</span>
          </div>
          <div className={'ow-step-line' + (step >= 2 ? ' is-done' : '')} />
          <div className={'ow-step' + (step >= 2 ? ' is-current' : '')}>
            <span className="ow-step-num">2</span>
            <span className="ow-step-label">Configure</span>
          </div>
        </div>

        {step === 1 && (
          <div className="ow-pane">
            <div className="ow-head">
              <h2 className="ow-title">Pick your analyst team</h2>
              <p className="ow-sub">
                Choose which AI specialists will debate at your Table.
                You can change this later from Manage.
              </p>
              <div className="ow-count">
                <span className="ow-count-num">{activeCount}</span> of {ANALYSTS.length} selected
                {activeCount < 2 && <span className="ow-count-warn"> · need at least 2</span>}
              </div>
            </div>

            <div className="ow-agent-grid">
              {ANALYSTS.map((a) => {
                const on = activeAgentKeys.has(a.key)
                return (
                  <button
                    key={a.key}
                    type="button"
                    className={'ow-agent-card' + (on ? ' is-on' : '')}
                    onClick={() => toggleAgent(a.key)}
                    aria-pressed={on}
                  >
                    <span className={'analyst-avatar tone-' + a.tone} data-key={a.key}>
                      {a.image
                        ? <img className="analyst-avatar-img" src={a.image} alt="" />
                        : <span className="analyst-glyph">{a.glyph}</span>}
                    </span>
                    <div className="ow-agent-info">
                      <div className="ow-agent-name">{a.name}</div>
                      <div className="ow-agent-spec">{a.specialty}</div>
                      <div className="ow-agent-tags">
                        {a.tags.map((t) => <span key={t} className="ow-agent-tag">{t}</span>)}
                      </div>
                    </div>
                    <span className={'ow-agent-toggle' + (on ? ' is-on' : '')}>
                      <span className="ow-agent-toggle-knob" />
                    </span>
                  </button>
                )
              })}
            </div>

            <InviteFriends />

            <div className="ow-actions">
              <button className="ow-btn ow-btn-ghost" onClick={close}>Cancel</button>
              <button
                className="ow-btn ow-btn-primary"
                onClick={() => setStep(2)}
                disabled={!canProceed}
              >
                Continue
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ow-pane">
            <div className="ow-head">
              <h2 className="ow-title">Set up your match</h2>
              <p className="ow-sub">
                {activeCount} analysts ready. Tell them what to debate.
              </p>
            </div>

            <div className="ow-form">
              <div className="ow-field">
                <label className="ow-label">Question</label>
                <div className="ow-segtabs">
                  <button
                    type="button"
                    className={'ow-segtab' + (topicMode === 'link' ? ' is-on' : '')}
                    onClick={() => setTopicMode('link')}
                  >Paste market link</button>
                  <button
                    type="button"
                    className={'ow-segtab' + (topicMode === 'custom' ? ' is-on' : '')}
                    onClick={() => setTopicMode('custom')}
                  >Custom question</button>
                </div>

                {topicMode === 'link' ? (
                  <>
                    <input
                      className="ow-input"
                      placeholder="https://polymarket.com/event/…"
                      value={marketUrl}
                      onChange={(e) => setMarketUrl(e.target.value)}
                    />
                    <div className="ow-hint">
                      We'll fetch the market's question and outcomes and turn them into your table's vote.
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      className="ow-input"
                      placeholder="e.g. Will Brazil win the World Cup?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                    <div className="ow-quick-questions">
                      {SAMPLE_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          className="ow-quick-chip"
                          onClick={() => setQuestion(q)}
                        >{q}</button>
                      ))}
                    </div>

                    <div className="ow-options">
                      <div className="ow-options-label">Vote options <span className="ow-label-opt">(min 2)</span></div>
                      {options.map((opt, i) => (
                        <div className="ow-option-row" key={i}>
                          <span className="ow-option-bullet">{String.fromCharCode(65 + i)}</span>
                          <input
                            className="ow-input ow-option-input"
                            placeholder={i === 0 ? 'e.g. Yes' : i === 1 ? 'e.g. No' : 'Another option'}
                            value={opt}
                            onChange={(e) => setOptionAt(i, e.target.value)}
                          />
                          <button
                            type="button"
                            className="ow-option-remove"
                            aria-label="Remove option"
                            disabled={options.length <= 2}
                            onClick={() => removeOption(i)}
                          >×</button>
                        </div>
                      ))}
                      {options.length < 6 && (
                        <button type="button" className="ow-option-add" onClick={addOption}>
                          + Add option
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="ow-field">
                <label className="ow-label">Debate language</label>
                <div className="ow-lang-grid">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={'ow-lang-chip' + (lang === l.code ? ' is-on' : '')}
                      onClick={() => setLang(l.code)}
                    >
                      <span className="ow-lang-flag">{l.flag}</span>
                      <span className="ow-lang-native">{l.native}</span>
                    </button>
                  ))}
                </div>
                <div className="ow-mike-hint">
                  <span className="ow-mike-hint-avatar" aria-hidden />
                  <div className="ow-mike-hint-text">
                    <div className="ow-mike-hint-title">Coach Mike speaks this language too</div>
                    <div className="ow-mike-hint-sub">
                      Your AI host will narrate the room out loud in the language you pick — voice and captions both.
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="ow-actions">
              <button className="ow-btn ow-btn-ghost" onClick={() => setStep(1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M19 12H5" />
                  <path d="M11 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                className="ow-btn ow-btn-primary"
                onClick={submit}
                disabled={!canSubmit}
              >
                Open Table
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ), document.body)
}

function InviteFriends() {
  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${Math.random().toString(36).slice(2, 8)}`
    : 'https://lokacup.app/join/xxxxxx'
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch (e) {}
  }
  return (
    <div className="ow-invite">
      <div className="ow-invite-text">
        <div className="ow-invite-title">Invite friends to your table</div>
        <div className="ow-invite-sub">Share this link — anyone who opens it joins as a guest.</div>
      </div>
      <div className="ow-invite-row">
        <input className="ow-invite-link" readOnly value={link} onFocus={(e) => e.target.select()} />
        <button type="button" className="ow-invite-copy" onClick={copy}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
