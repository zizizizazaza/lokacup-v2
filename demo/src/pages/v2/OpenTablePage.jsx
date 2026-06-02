import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OpenTablePage() {
  const [url, setUrl] = useState('')
  const [hostMode, setHostMode] = useState('me')
  const navigate = useNavigate()

  const submit = () => {
    // In a real build this would create a table. For demo, just route to an existing one.
    navigate('/table/fra-can-mbappe')
  }

  return (
    <div className="container">
      <div className="open-shell">
        <h2>Open your own table</h2>
        <p className="subtitle">
          Pick a Polymarket or Kalshi market, choose who hosts, and start the conversation.
        </p>

        <div className="open-form">
          <div>
            <label>Market URL</label>
            <input
              className="url-input"
              placeholder="https://polymarket.com/event/…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label>Host preference</label>
            <div className="host-options">
              <div
                className={'host-option' + (hostMode === 'ai' ? ' selected' : '')}
                onClick={() => setHostMode('ai')}
              >
                <div className="opt-radio" />
                <div className="opt-body">
                  <div className="opt-title">🤖 Let LokaCup AI host</div>
                  <div className="opt-desc">
                    The AI runs the conversation automatically — generating questions, analysis, and recalibrations as the match unfolds. You and others can watch and fork.
                  </div>
                </div>
              </div>
              <div
                className={'host-option' + (hostMode === 'me' ? ' selected' : '')}
                onClick={() => setHostMode('me')}
              >
                <div className="opt-radio" />
                <div className="opt-body">
                  <div className="opt-title">🎙 I'll host</div>
                  <div className="opt-desc">
                    You are the only one who can prompt the AI on this table. Spectators can watch and fork your conversation into private chats.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="open-submit" onClick={submit}>Open table</button>
        </div>
      </div>
    </div>
  )
}
