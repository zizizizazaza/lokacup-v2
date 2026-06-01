import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import MarketCard from '../components/MarketCard'
import Footer from '../components/Footer'

const MARKETS = [
  {
    variant: 'highlight',
    title: 'Outright Winner 2026',
    vol: '$14.2M',
    rows: [
      { rank: '01', label: 'Brazil', value: '18.5%', dir: 'up', tone: '' },
      { rank: '02', label: 'France', value: '16.2%', dir: 'flat', tone: 'flat' },
      { rank: '03', label: 'Argentina', value: '12.0%', dir: 'down', tone: 'down' },
    ],
    cta: 'Ask AI for edge',
  },
  {
    title: 'Golden Boot',
    vol: '$4.8M',
    rows: [
      { rank: '01', label: 'Mbappé', value: '22%', dir: 'up' },
      { rank: '02', label: 'Haaland', value: '15%', dir: 'up' },
      { rank: '03', label: 'Vini Jr.', value: '11%', dir: 'flat', tone: 'flat' },
    ],
    cta: 'Evaluate form',
  },
  {
    title: 'Tournament Total Goals',
    vol: '$2.1M',
    rows: [
      { label: 'Over 168.5', value: '54%', dir: 'up' },
      { label: 'Under 168.5', value: '46%', dir: 'down', tone: 'down' },
    ],
    cta: 'Analyze historic data',
  },
  {
    variant: 'arb',
    title: 'Cross-Platform Arb',
    volLabel: 'Spread',
    vol: '4.2%',
    sublabel: 'USA to advance from Group Stage — discrepancy between Polymarket and Kalshi order books.',
    rows: [
      { label: 'Polymarket (YES)', value: '42.0%', tone: 'flat' },
      { label: 'Kalshi (NO)', value: '53.8%', tone: 'flat' },
    ],
    cta: 'Calculate arb path',
  },
]

const FILTERS = ['All', 'Winner odds', 'Player props', 'Market moves', 'Arb targets']

const QUESTIONS = [
  "Is Argentina's 12% probability rational based on qualifying stats?",
  'Will Neymar score tonight? Cross-reference Kalshi injury reports.',
  "Why did France's odds drop 3% in the last 4 hours?",
  'Find me the highest +EV bet for the Golden Boot right now.',
  'Compare Polymarket vs Kalshi odds for England reaching the semis.',
  'Analyze weather impact on the Total Goals Under 168.5 market.',
  'What does the AI consensus say about USA vs Mexico outrights?',
]

export default function AskPage() {
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()

  return (
    <>
      <Hero />
      <div id="main" className="container">

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Hot markets</h2>
          <div className="section-meta">$42.8M live volume · updated 12s ago</div>
        </div>
        <div className="markets-grid">
          {MARKETS.map((m) => <MarketCard key={m.title} market={m} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Suggested questions</h2>
          <div className="section-meta">7 prompts · updated 8s ago</div>
        </div>
        <div className="filter-header">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={'filter-chip' + (filter === f ? ' active' : '') + (f === 'Arb targets' ? ' arb' : '')}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="questions-grid">
          {QUESTIONS.map((q) => (
            <div key={q} className="q-chip" onClick={() => navigate('/analysis/demo', { state: { query: q } })}>
              {q}
            </div>
          ))}
        </div>
      </section>

      <Footer />
      </div>
    </>
  )
}
