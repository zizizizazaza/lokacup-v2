import { useNavigate } from 'react-router-dom'

function Trend({ dir }) {
  if (dir === 'up') return <span className="trend">▲</span>
  if (dir === 'down') return <span className="trend">▼</span>
  return <span className="trend dim">—</span>
}

export default function MarketCard({ market }) {
  const navigate = useNavigate()
  const { variant, title, volLabel, vol, sublabel, rows, cta } = market
  const cls = ['market-card']
  if (variant === 'highlight') cls.push('highlight')
  if (variant === 'arb') cls.push('arb')

  return (
    <article className={cls.join(' ')}>
      <div className="mc-header">
        <h3 className="mc-title">{title}</h3>
        <div className={'mc-vol' + (variant === 'arb' ? ' arb-spread' : '')}>
          {volLabel || '24H VOL'}
          <br />
          <span>{vol}</span>
        </div>
      </div>
      {sublabel && <div className="mc-sublabel">{sublabel}</div>}
      <ul className="data-list">
        {rows.map((r, i) => (
          <li key={i} className="data-row">
            <span className="team-name">
              {r.rank && <span className="rank">{r.rank}</span>}
              {r.label}
            </span>
            <span className={'prob' + (r.tone ? ' ' + r.tone : '')}>
              {r.value}
              {r.dir && <Trend dir={r.dir} />}
            </span>
          </li>
        ))}
      </ul>
      <button className="btn-card" onClick={() => navigate('/analysis/demo', { state: { query: title } })}>
        {cta}
      </button>
    </article>
  )
}
