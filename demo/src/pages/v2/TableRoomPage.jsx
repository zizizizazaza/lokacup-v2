import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTable, ME_HANDLE } from '../../data/tables'

function Message({ m, onFork }) {
  if (m.role === 'system') {
    return (
      <div className="msg system">
        <div className="msg-bubble system">{m.text}</div>
      </div>
    )
  }
  const isAI = m.role === 'ai'
  return (
    <div className="msg">
      <div className={'msg-avatar ' + m.role}>{isAI ? 'AI' : 'H'}</div>
      <div className="msg-body">
        <div className="msg-meta-row">
          <span className="who">{isAI ? 'AI · 4 agents' : 'Host'}</span>
          {m.meta && <span className="tag">{m.meta}</span>}
        </div>
        <div className={'msg-bubble ' + m.role}>{m.text}</div>
        {isAI && (
          <div className="msg-actions">
            <button className="fork-btn" onClick={onFork}>Fork from here</button>
          </div>
        )}
      </div>
    </div>
  )
}

const DANMAKU = [
  { who: '0xA1c3…b27e', text: 'BRA midfield looks shaky after the goal' },
  { who: '0xB244…1f89', text: 'MAR xG climbing — they could equalize again' },
  { who: '0x91dd…0f4a', text: 'casemiro near a yellow, watch out' },
]

export default function TableRoomPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = getTable(id)
  const [messages, setMessages] = useState(t?.messages || [])
  const [input, setInput] = useState('')

  if (!t) {
    return (
      <div className="container">
        <p style={{ marginTop: '4rem' }}>Table not found.</p>
        <button className="tr-back" onClick={() => navigate('/')}>← Back to tables</button>
      </div>
    )
  }

  // In MVP, only the user-as-host can prompt the AI. For official tables, host is AI itself
  // so the chat input is hidden — users must Fork to interact.
  const isHostMe = !t.isOfficial && t.host.handle === ME_HANDLE
  const canHost = isHostMe // simplified: only treat as host if you literally are the host handle

  const send = (text) => {
    const v = (text ?? input).trim()
    if (!v) return
    setMessages((prev) => [
      ...prev,
      { role: 'host', text: v },
      { role: 'ai', text: 'Re-running 4 agents with the new context…', meta: 'Streaming' },
    ])
    setInput('')
  }

  const fork = (msgIndex) => {
    navigate(`/fork/new`, {
      state: {
        sourceTableId: t.id,
        sourceTitle: t.market.title,
        sourceHost: t.host.handle,
        forkAt: msgIndex,
        history: messages.slice(0, msgIndex + 1),
      },
    })
  }

  return (
    <div className="container">
      <div className="table-room">
        <div className="tr-top">
          <button className="tr-back" onClick={() => navigate('/')}>← Back to tables</button>
          <h2 className="tr-title">{t.market.title}</h2>
          <div className="tr-meta">
            <span className="pill">{t.host.handle}</span>
            <span className="pill">{t.spectatorCount} watching</span>
            <span className="pill">{t.forkCount} forks</span>
            <span className={'pill ' + (t.market.edge > 0 ? 'edge-up' : t.market.edge < 0 ? 'edge-down' : '')}>
              AI {t.market.aiConsensus}% vs Market {t.market.currentPrice}% ({t.market.edge > 0 ? '+' : ''}{t.market.edge}pt)
            </span>
          </div>
        </div>

        {/* Main chat */}
        <div className="tr-chat">
          <div className="chat-stream">
            {messages.map((m, i) => (
              <Message key={i} m={m} onFork={() => fork(i)} />
            ))}
          </div>

          {canHost ? (
            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder="Ask the AI anything about this market…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button className="chat-send" onClick={() => send()}>Send</button>
            </div>
          ) : (
            <div className="chat-input-readonly">
              <span className="lock">Locked</span>
              <span>Only the host can prompt the AI on this table.</span>
              <button onClick={() => fork(messages.length - 1)}>Fork to ask privately</button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="tr-side">
          <div className="side-card">
            <h4>Market</h4>
            <div className="market-row"><span>Platform</span><span className="v">{t.market.platform}</span></div>
            <div className="market-row"><span>Current price</span><span className="v">{t.market.currentPrice}%</span></div>
            <div className="market-row"><span>AI consensus</span><span className="v ai">{t.market.aiConsensus}%</span></div>
            <div className="market-row"><span>24h volume</span><span className="v">{t.market.volume24h}</span></div>
            {t.market.isArb && (
              <div className="market-row"><span>Arb spread</span><span className="v" style={{ color: 'var(--accent-blue)' }}>{t.market.arbSpread}%</span></div>
            )}
            <a className="market-link" href={t.market.url} target="_blank" rel="noreferrer">
              View on {t.market.platform.split(' ')[0]} ↗
            </a>
          </div>

          <div className="side-card">
            <h4>Spectators ({t.spectatorCount})</h4>
            <div className="spectator-list">
              <div className="spectator host-row">
                <span className="spectator-avatar" />
                <span>{t.host.handle}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--fg-dim)' }}>HOST</span>
              </div>
              {t.spectators.slice(0, 5).map((s) => (
                <div key={s.handle} className="spectator">
                  <span className="spectator-avatar" />
                  <span>{s.handle}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--fg-dim)' }}>{s.joinedAgo}</span>
                </div>
              ))}
              {t.spectatorCount > 5 && (
                <div className="spectator-more">+{t.spectatorCount - 5} more</div>
              )}
            </div>
          </div>

          <div className="side-card">
            <h4>Chat ({DANMAKU.length})</h4>
            <div className="danmaku-list">
              {DANMAKU.map((d, i) => (
                <div key={i} className="danmaku">
                  <div className="who">{d.who}</div>
                  <div>{d.text}</div>
                </div>
              ))}
            </div>
            <div className="danmaku-readonly-note">Spectator chat (read-only in MVP)</div>
          </div>
        </aside>
      </div>
    </div>
  )
}
