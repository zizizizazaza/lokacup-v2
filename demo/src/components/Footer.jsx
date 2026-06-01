import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="footer">
      <div className="f-stats">
        <div className="stat-block">
          <div className="label">Historic accuracy (WC22)</div>
          <div className="value highlight">84.7%</div>
        </div>
        <div className="stat-block">
          <div className="label">Active agents</div>
          <div className="value">04</div>
        </div>
        <div className="stat-block">
          <div className="label">Models</div>
          <div className="value models">GPT-4o, Claude 3.5, Llama-3, Mistral</div>
        </div>
      </div>
      <a className="f-link" onClick={() => navigate('/matches')}>
        Browse all matches
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </footer>
  )
}
