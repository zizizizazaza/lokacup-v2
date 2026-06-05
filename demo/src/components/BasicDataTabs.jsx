import { useState } from 'react'
import LivePitch from './LivePitch.jsx'
import MainAnalysisTabs from './MainAnalysisTabs.jsx'

// Three tabs: AI analysis (multi-round debate, default), Match data (pitch + stats),
// and Market (Polymarket flow + related markets).
const TABS = [
  { key: 'ai',     label: 'AI analysis' },
  { key: 'match',  label: 'Match data' },
  { key: 'market', label: 'Market' },
]

const MATCH_STATS = [
  { lbl: 'Possession', a: 58, b: 42, unit: '%' },
  { lbl: 'Shots',      a: 14, b: 6  },
  { lbl: 'On target',  a: 6,  b: 3  },
  { lbl: 'xG',         a: 1.7, b: 1.1, fixed: 1 },
  { lbl: 'Corners',    a: 7,  b: 2  },
  { lbl: 'Fouls',      a: 9,  b: 11 },
  { lbl: 'Pass acc',   a: 87, b: 79, unit: '%' },
]

const RECENT_EVENTS = [
  { min: '67′', kind: 'sub',    text: 'Field substitution · Ziyech on for En-Nesyri' },
  { min: '62′', kind: 'shot',   text: 'Vinícius hit the post' },
  { min: '58′', kind: 'yellow', text: 'Casemiro booked' },
  { min: '58′', kind: 'goal',   text: 'Vinícius scored — Brazil 2-1' },
  { min: '41′', kind: 'goal',   text: 'Hakimi equalized — Brazil 1-1' },
  { min: '38′', kind: 'shot',   text: 'Brazil corner saved' },
  { min: '23′', kind: 'goal',   text: 'Neymar opened — Brazil 1-0' },
]

const TRADES = [
  { side: 'Yes', size: '$42k',  who: 'whale01',  age: '14s' },
  { side: 'Yes', size: '$8.2k', who: '0xb31a…', age: '52s' },
  { side: 'No',  size: '$3.1k', who: '0x77c2…', age: '1m'  },
  { side: 'Yes', size: '$1.4k', who: '0x901e…', age: '2m'  },
  { side: 'Yes', size: '$640',  who: '0x4c89…', age: '3m'  },
  { side: 'No',  size: '$2.0k', who: '0xa12a…', age: '4m'  },
]

const RELATED = [
  { title: 'Brazil to win the World Cup',  yes: 21, no: 79, vol: '$2.3M' },
  { title: 'Vinícius to score anytime',    yes: 64, no: 36, vol: '$420k' },
  { title: 'Match total goals — Over 2.5', yes: 71, no: 29, vol: '$880k' },
  { title: 'Both teams to score',          yes: 68, no: 32, vol: '$510k' },
  { title: 'Brazil to win to nil',         yes: 22, no: 78, vol: '$190k' },
  { title: 'Morocco to score in 2nd half', yes: 42, no: 58, vol: '$260k' },
]

export default function BasicDataTabs({ market, pair }) {
  const [tab, setTab] = useState('ai')

  return (
    <div className="bdt">
      <div className="bdt-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={'bdt-tab' + (tab === t.key ? ' is-on' : '')}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bdt-pane">
        {tab === 'match' && (
          <div className="bdt-match-pane">
            {/* Horizontal pitch on top, full width */}
            <div className="bdt-pitch-wrap">
              <LivePitch orientation="horizontal" />
            </div>

            {/* Stats + recent events side by side */}
            <div className="bdt-match-grid">
              <div className="bdt-match-col">
                <div className="bdt-col-head">
                  <span>Match stats</span>
                  <span className="bdt-col-time">67′</span>
                </div>
                <div className="insight-stats">
                  {MATCH_STATS.map((s) => {
                    const total = s.a + s.b
                    const aPct = total ? (s.a / total) * 100 : 50
                    return (
                      <div key={s.lbl} className="insight-stat-row">
                        <span className="insight-stat-val left">{s.fixed != null ? s.a.toFixed(s.fixed) : s.a}{s.unit || ''}</span>
                        <div className="insight-stat-mid">
                          <div className="insight-stat-bar">
                            <div className="insight-stat-bar-a" style={{ width: aPct + '%' }} />
                          </div>
                          <span className="insight-stat-label">{s.lbl}</span>
                        </div>
                        <span className="insight-stat-val right">{s.fixed != null ? s.b.toFixed(s.fixed) : s.b}{s.unit || ''}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bdt-match-col">
                <div className="bdt-col-head">
                  <span>Recent events</span>
                </div>
                <ul className="insight-events">
                  {RECENT_EVENTS.map((e, i) => (
                    <li key={i} className={'insight-event ev-' + e.kind}>
                      <span className="insight-event-min">{e.min}</span>
                      <span className="insight-event-text">{e.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'market' && (
          <div className="bdt-market-pane">
            <div className="bdt-market-head">
              <div>
                <div className="bdt-market-label">Polymarket flow · last 5 min</div>
                <div className="bdt-market-sub">Brazil to win · $1.2M volume</div>
              </div>
              <div className="bdt-market-price">
                <span className="bdt-market-price-val">68%</span>
                <span className="bdt-market-price-delta">+3%</span>
              </div>
            </div>

            <div className="bdt-market-grid">
              <div className="bdt-market-col">
                <div className="bdt-col-head">
                  <span>Recent trades</span>
                </div>
                <div className="insight-trades">
                  {TRADES.map((tr, i) => (
                    <div key={i} className={'insight-trade side-' + tr.side.toLowerCase()}>
                      <span className="insight-trade-side">{tr.side}</span>
                      <span className="insight-trade-size">{tr.size}</span>
                      <span className="insight-trade-who">{tr.who}</span>
                      <span className="insight-trade-age">{tr.age}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bdt-market-col">
                <div className="bdt-col-head">
                  <span>Related markets</span>
                  <span className="bdt-col-time">on this match</span>
                </div>
                <div className="mac-mkt-list">
                  {RELATED.map((m, i) => (
                    <a key={i} className="mac-mkt" href="#" onClick={(e) => e.preventDefault()}>
                      <div className="mac-mkt-title">{m.title}</div>
                      <div className="mac-mkt-stats">
                        <div className="mac-mkt-prob">
                          <span className="mac-mkt-prob-yes">Yes <b>{m.yes}%</b></span>
                          <span className="mac-mkt-prob-no">No <b>{m.no}%</b></span>
                        </div>
                        <div className="mac-mkt-bar">
                          <span className="mac-mkt-bar-yes" style={{ width: m.yes + '%' }} />
                        </div>
                        <div className="mac-mkt-vol">{m.vol}<span> vol</span></div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'ai' && (
          <div className="bdt-ai-pane">
            <MainAnalysisTabs market={market} pair={pair} />
          </div>
        )}
      </div>
    </div>
  )
}
