import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function ForkPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [published, setPublished] = useState(false)
  const [input, setInput] = useState('')

  const fallbackHistory = [
    { role: 'host', text: 'Original conversation from the source table…' },
    { role: 'ai', text: 'Original AI analysis snippet…', meta: 'Block 01' },
  ]

  const sourceTitle = state?.sourceTitle || 'Brazil vs Morocco — match winner'
  const sourceHost = state?.sourceHost || 'LokaCup AI'
  const sourceTableId = state?.sourceTableId || 'bra-mar-winner'
  const forkAt = state?.forkAt ?? 5
  const history = state?.history || fallbackHistory

  const [myMessages, setMyMessages] = useState([
    { role: 'host', text: 'OK so picking up where you left off — what happens if Casemiro gets subbed off in the next 10 minutes?' },
    {
      role: 'ai',
      text: "Probability drops to ~64%. Casemiro shields the back-4 from Morocco's counter — without him, BRA midfield is more porous against Ziyech. Endrick would likely come on but skews offensive.",
      meta: 'Block 04 · Scenario',
    },
  ])

  const send = () => {
    const v = input.trim()
    if (!v) return
    setMyMessages((prev) => [
      ...prev,
      { role: 'host', text: v },
      { role: 'ai', text: 'Running multi-agent analysis with new context…', meta: 'Streaming' },
    ])
    setInput('')
  }

  return (
    <div className="container">
      <div className="fork-shell">
        <button className="tr-back" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>

        <div className="fork-banner">
          <div className="fork-banner-left">
            <div className="fork-from">Forked from {sourceHost}'s table at msg #{forkAt + 1}</div>
            <div className="src-title">
              <Link to={`/table/${sourceTableId}`} style={{ color: 'var(--accent-green)' }}>{sourceTitle}</Link>
            </div>
          </div>
          {published ? (
            <span className="fork-tag published">Published ✓</span>
          ) : (
            <button className="fork-publish" onClick={() => setPublished(true)}>
              Publish to public table
            </button>
          )}
        </div>

        {/* Source history (dimmed) */}
        <div className="tr-chat fork-source-section">
          <div className="fork-divider">— from original table —</div>
          <div className="chat-stream">
            {history.map((m, i) => (
              <div key={i} className="msg">
                {m.role !== 'system' && <div className={'msg-avatar ' + m.role}>{m.role === 'ai' ? 'AI' : 'H'}</div>}
                <div className="msg-body">
                  <div className="msg-meta-row">
                    <span className="who">{m.role === 'ai' ? 'AI · 4 agents' : 'Host'}</span>
                    {m.meta && <span className="tag">{m.meta}</span>}
                  </div>
                  <div className={'msg-bubble ' + m.role}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My fork conversation */}
        <div className="tr-chat" style={{ marginTop: '1.5rem' }}>
          <div className="fork-divider">— my fork (private) —</div>
          <div className="chat-stream">
            {myMessages.map((m, i) => (
              <div key={i} className="msg">
                <div className={'msg-avatar ' + m.role}>{m.role === 'ai' ? 'AI' : 'H'}</div>
                <div className="msg-body">
                  <div className="msg-meta-row">
                    <span className="who">{m.role === 'ai' ? 'AI · 4 agents' : 'You'}</span>
                    {m.meta && <span className="tag">{m.meta}</span>}
                  </div>
                  <div className={'msg-bubble ' + m.role}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask AI anything — this is your private chat"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button className="chat-send" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
