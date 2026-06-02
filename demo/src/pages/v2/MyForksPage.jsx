import { useNavigate } from 'react-router-dom'
import { MY_FORKS } from '../../data/tables'

export default function MyForksPage() {
  const navigate = useNavigate()

  return (
    <div className="container">
      <section className="tables-section">
        <div className="section-header">
          <h2 className="section-title">My forks</h2>
          <div className="section-meta">{MY_FORKS.length} private chats</div>
        </div>

        {MY_FORKS.length === 0 ? (
          <p style={{ color: 'var(--fg-dim)' }}>
            You haven't forked any tables yet. Browse the live tables and click "Fork from here" on any AI message.
          </p>
        ) : (
          <div className="forks-list">
            {MY_FORKS.map((f) => (
              <div key={f.id} className="fork-row" onClick={() => navigate('/fork/' + f.id)}>
                <div>
                  <div className="fork-title">{f.sourceMarket}</div>
                  <div className="fork-from-line">
                    Forked from {f.sourceHost} at {f.forkedAt} · {f.createdAgo} ago
                  </div>
                  <div className="fork-from-line" style={{ marginTop: '0.3rem', color: 'var(--fg-secondary)' }}>
                    Last: "{f.lastMessage}"
                  </div>
                </div>
                <span className={'fork-tag' + (f.isPublished ? ' published' : '')}>
                  {f.isPublished ? 'Published' : 'Private'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
