import { useNavigate } from 'react-router-dom'

function Trend({ dir }) {
  if (dir === 'up') return <span className="pm-trend up">↑</span>
  if (dir === 'down') return <span className="pm-trend down">↓</span>
  return <span className="pm-trend flat">→</span>
}

export default function MarketCard({ market }) {
  const navigate = useNavigate()
  const { home, away, league, question, platform, vol, options } = market

  const goAsk = (extra) => {
    const q = extra ? `${home.name} vs ${away.name}: ${question} — ${extra}` : `${home.name} vs ${away.name}: ${question}`
    navigate('/analysis/demo', { state: { query: q } })
  }

  return (
    <article className="pm-card" onClick={() => goAsk()} role="button" tabIndex={0}>
      <div className="pm-card-head">
        <div className="pm-matchup">
          <span className="pm-flag-l">{home.flag}</span>
          <span className="pm-vs-text">{home.name} <span className="pm-vs">vs</span> {away.name}</span>
          <span className="pm-flag-r">{away.flag}</span>
        </div>
        <div className="pm-league">{league}</div>
      </div>

      <div className="pm-question">{question}</div>

      <div className="pm-options">
        {options.map((opt) => (
          <button
            key={opt.label}
            className="pm-option"
            onClick={(e) => { e.stopPropagation(); goAsk(opt.label) }}
          >
            <div className="pm-opt-left">
              {opt.flag && <span className="pm-opt-flag">{opt.flag}</span>}
              <span className="pm-opt-label">{opt.label}</span>
            </div>
            <div className="pm-opt-right">
              <span className="pm-yes-pill">
                Yes <b>{opt.yes}¢</b>
                <Trend dir={opt.dir} />
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="pm-card-foot">
        <span className="pm-platform">{platform}</span>
        <span className="pm-dot">·</span>
        <span className="pm-vol">{vol} Vol · 24h</span>
      </div>

      <button
        className="pm-ask"
        onClick={(e) => { e.stopPropagation(); goAsk() }}
      >
        <span className="pm-ask-icon">▶</span> Ask AI
      </button>
    </article>
  )
}
