import { useNavigate } from 'react-router-dom'

const LIVE_MATCHES = [
  {
    id: 'bra-mar',
    league: 'Group D · MetLife Stadium',
    status: 'live',
    minute: "65'",
    home: { flag: '🇧🇷', name: 'Brazil', score: 2, form: ['W', 'W', 'D', 'W', 'L'] },
    away: { flag: '🇲🇦', name: 'Morocco', score: 1, form: ['W', 'D', 'W', 'L', 'W'] },
    h2h: 'Last 5 H2H: Brazil 3W · 1D · 1L · avg 2.4 goals',
    lineup: 'Lineups confirmed · Neymar starts · Mazraoui (MAR) out',
    events: [
      { min: "23'", text: '⚽ Neymar' },
      { min: "41'", text: '⚽ Hakimi' },
      { min: "58'", text: '⚽ Vinicius' },
      { min: "35'", text: '🟨 Casemiro' },
    ],
    stats: { poss: ['54%', '46%'], shots: ['12', '8'], onT: ['5', '3'], corners: ['6', '2'], xg: ['1.8', '0.9'] },
    weather: '☀ 24°C · Humidity 60% · Light wind',
    marketGroups: [
      {
        platform: 'Polymarket',
        url: 'https://polymarket.com/event/brazil-vs-morocco',
        items: [
          { q: 'Match winner', options: [['BRA', 68], ['Draw', 18], ['MAR', 14]], volNum: 1200000, url: 'https://polymarket.com/event/brazil-vs-morocco-winner', hot: true },
          { q: 'Total goals 3+', options: [['Yes', 62], ['No', 38]], volNum: 480000, url: 'https://polymarket.com/event/bra-mar-totals-3' },
          { q: 'Both teams to score', options: [['Yes', 81], ['No', 19]], volNum: 310000, url: 'https://polymarket.com/event/bra-mar-btts' },
          { q: 'Neymar to score', options: [['Yes', 54], ['No', 46]], volNum: 220000, url: 'https://polymarket.com/event/neymar-anytime' },
          { q: 'Brazil clean sheet', options: [['Yes', 28], ['No', 72]], volNum: 95000, url: 'https://polymarket.com/event/bra-cs' },
        ],
      },
      {
        platform: 'Kalshi',
        url: 'https://kalshi.com/markets/brazil-qf',
        items: [
          { q: 'Brazil to advance to QF', options: [['Yes', 81], ['No', 19]], volNum: 210000, url: 'https://kalshi.com/markets/brazil-qf', hot: true },
          { q: 'Brazil to win WC 2026', options: [['Yes', 18], ['No', 82]], volNum: 180000, url: 'https://kalshi.com/markets/brazil-wc' },
        ],
      },
    ],
  },
  {
    id: 'fra-can',
    league: 'Group D · Toronto',
    status: 'live',
    minute: "32'",
    home: { flag: '🇫🇷', name: 'France', score: 1, form: ['W', 'W', 'W', 'D', 'W'] },
    away: { flag: '🇨🇦', name: 'Canada', score: 0, form: ['L', 'W', 'L', 'D', 'L'] },
    h2h: 'Last 3 H2H: France 3W · 0D · 0L · avg 3.0 goals',
    lineup: 'Mbappé starts · Davies (CAN) out · 4-2-3-1',
    events: [
      { min: "18'", text: '⚽ Mbappé' },
      { min: "29'", text: '🟨 Tchouameni' },
    ],
    stats: { poss: ['62%', '38%'], shots: ['7', '3'], onT: ['3', '1'], corners: ['4', '1'], xg: ['1.1', '0.3'] },
    weather: '⛅ 18°C · Humidity 72% · Moderate wind',
    marketGroups: [
      {
        platform: 'Polymarket',
        url: 'https://polymarket.com/event/france-vs-canada',
        items: [
          { q: 'Match winner', options: [['FRA', 82], ['Draw', 12], ['CAN', 6]], volNum: 890000, url: 'https://polymarket.com/event/fra-can-winner', hot: true },
          { q: 'Mbappé 2+ goals', options: [['Yes', 38], ['No', 62]], volNum: 310000, url: 'https://polymarket.com/event/mbappe-2plus' },
          { q: 'Total goals 2.5 over', options: [['Over', 71], ['Under', 29]], volNum: 240000, url: 'https://polymarket.com/event/fra-can-totals' },
          { q: 'France to win to nil', options: [['Yes', 47], ['No', 53]], volNum: 120000, url: 'https://polymarket.com/event/fra-cs' },
        ],
      },
      {
        platform: 'Kalshi',
        url: 'https://kalshi.com/markets/france-qf',
        items: [
          { q: 'France to top Group D', options: [['Yes', 88], ['No', 12]], volNum: 140000, url: 'https://kalshi.com/markets/france-topd' },
        ],
      },
    ],
  },
]

const UPCOMING = [
  {
    in: 'in 2h', kickoff: 'Today 21:00',
    home: { flag: '🇺🇸', name: 'USA', form: ['W', 'D', 'W', 'W', 'L'] },
    away: { flag: '🇵🇾', name: 'Paraguay', form: ['L', 'W', 'D', 'L', 'W'] },
    odds: '58 / 24 / 18%', h2h: 'Last meet: USA 2-1 (2022)', weather: '☀ 22°C',
  },
  {
    in: 'in 5h', kickoff: 'Today 24:00',
    home: { flag: '🇩🇪', name: 'Germany', form: ['W', 'W', 'W', 'D', 'W'] },
    away: { flag: '🇨🇼', name: 'Curaçao', form: ['D', 'L', 'L', 'W', 'L'] },
    odds: '77 / 15 / 8%', h2h: 'First meeting', weather: '⛅ 19°C',
  },
  {
    in: 'Tomorrow 09:00', kickoff: 'Jun 13 09:00',
    home: { flag: '🇫🇷', name: 'France', form: ['W', 'W', 'W', 'D', 'W'] },
    away: { flag: '🇨🇦', name: 'Canada', form: ['L', 'W', 'L', 'D', 'L'] },
    odds: '50 / 26 / 24%', h2h: 'Last meet: FRA 4-0 (2024)', weather: '☀ 24°C',
  },
  {
    in: 'Tomorrow 12:00', kickoff: 'Jun 13 12:00',
    home: { flag: '🇵🇹', name: 'Portugal', form: ['W', 'D', 'W', 'W', 'W'] },
    away: { flag: '🇲🇽', name: 'Mexico', form: ['D', 'W', 'L', 'W', 'D'] },
    odds: '63 / 22 / 15%', h2h: 'Last 3: POR 2W · 1D', weather: '☀ 26°C',
  },
  {
    in: 'Tomorrow 15:00', kickoff: 'Jun 13 15:00',
    home: { flag: '🇪🇸', name: 'Spain', form: ['W', 'W', 'L', 'W', 'W'] },
    away: { flag: '🇲🇦', name: 'Morocco', form: ['W', 'D', 'W', 'L', 'W'] },
    odds: '60 / 25 / 15%', h2h: 'Last meet: MAR 0-0 pen (2022)', weather: '⛅ 21°C',
  },
  {
    in: 'Jun 14, 09:00', kickoff: 'Jun 14 09:00',
    home: { flag: '🇭🇹', name: 'Haiti', form: ['L', 'D', 'L', 'W', 'L'] },
    away: { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scotland', form: ['D', 'W', 'D', 'L', 'D'] },
    odds: '32 / 28 / 40%', h2h: 'First meeting', weather: '☔ 15°C',
  },
]

const HISTORY = [
  {
    id: 'arg-uru',
    date: 'Jun 10',
    home: { flag: '🇦🇷', name: 'Argentina', score: 3 },
    away: { flag: '🇺🇾', name: 'Uruguay', score: 1 },
    aiSummary: { hit: 3, total: 3 },
    markets: [
      { q: 'Match winner', aiPre: 'ARG 64%', actual: 'ARG', correct: true, peak: 'peaked 88% at 71\'' },
      { q: 'Over 2.5 goals', aiPre: 'Yes 58%', actual: 'Yes (4 goals)', correct: true },
      { q: 'BTTS', aiPre: 'Yes 71%', actual: 'Yes', correct: true },
    ],
  },
  {
    id: 'eng-bel',
    date: 'Jun 9',
    home: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England', score: 1 },
    away: { flag: '🇧🇪', name: 'Belgium', score: 2 },
    aiSummary: { hit: 1, total: 3 },
    markets: [
      { q: 'Match winner', aiPre: 'ENG 51%', actual: 'BEL', correct: false, peak: 'dropped to 22% at 67\'' },
      { q: 'Over 2.5 goals', aiPre: 'Yes 62%', actual: 'Yes (3 goals)', correct: true },
      { q: 'Lukaku to score', aiPre: 'Yes 41%', actual: 'No', correct: false },
    ],
  },
  {
    id: 'esp-ger',
    date: 'Jun 8',
    home: { flag: '🇪🇸', name: 'Spain', score: 2 },
    away: { flag: '🇩🇪', name: 'Germany', score: 2 },
    aiSummary: { hit: 2, total: 3 },
    markets: [
      { q: 'Match winner', aiPre: 'ESP 47%', actual: 'Draw', correct: false, peak: 'leveled at 35-38-27' },
      { q: 'Over 2.5 goals', aiPre: 'Yes 69%', actual: 'Yes (4 goals)', correct: true },
      { q: 'BTTS', aiPre: 'Yes 78%', actual: 'Yes', correct: true },
    ],
  },
  {
    id: 'fra-por',
    date: 'Jun 7',
    home: { flag: '🇫🇷', name: 'France', score: 2 },
    away: { flag: '🇵🇹', name: 'Portugal', score: 0 },
    aiSummary: { hit: 3, total: 3 },
    markets: [
      { q: 'Match winner', aiPre: 'FRA 58%', actual: 'FRA', correct: true },
      { q: 'Under 2.5 goals', aiPre: 'Yes 54%', actual: 'Yes (2 goals)', correct: true },
      { q: 'Mbappé to score', aiPre: 'Yes 47%', actual: 'Yes', correct: true, peak: 'jumped to 81% at 23\'' },
    ],
  },
]

function formatVol(n) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return '$' + Math.round(n / 1_000) + 'k'
  return '$' + n
}

function FormDots({ form }) {
  return (
    <span className="form-dots" title={form.join(' · ')}>
      {form.map((r, i) => (
        <span key={i} className={`form-dot form-${r.toLowerCase()}`}>{r}</span>
      ))}
    </span>
  )
}

export default function MatchesPage() {
  const navigate = useNavigate()
  return (
    <div className="container">
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Matches</h2>
          <div className="section-meta">2 live · 6 upcoming · refreshes every 30s</div>
        </div>

        <div className="filter-header">
          {['All', 'Group stage', 'Knockout', 'Host country', 'High action'].map((f, i) => (
            <button key={f} className={'filter-chip' + (i === 0 ? ' active' : '')}>{f}</button>
          ))}
        </div>

        {LIVE_MATCHES.map((m) => (
          <article key={m.id} className="match-card">
            <div className="mc-left">
              <div className="mc-meta-row">
                <span>{m.league}</span>
                <span className="mc-meta-status">● Live · {m.minute}</span>
              </div>
              <div className="mc-score-row">
                <div className="mc-team"><span className="mc-flag">{m.home.flag}</span>{m.home.name}</div>
                <div className="mc-score">{m.home.score} : {m.away.score}</div>
                <div className="mc-team away">{m.away.name}<span className="mc-flag" style={{marginLeft: '0.4rem', marginRight: 0}}>{m.away.flag}</span></div>
              </div>

              <div className="mc-form-row">
                <div className="form-side"><span className="form-label">Last 5</span><FormDots form={m.home.form} /></div>
                <div className="form-side away"><FormDots form={m.away.form} /><span className="form-label">Last 5</span></div>
              </div>
              <div className="mc-h2h">{m.h2h}</div>

              <div className="mc-events">
                {m.events.map((e, i) => (
                  <div key={i} className="ev"><span className="min">{e.min}</span><span>{e.text}</span></div>
                ))}
              </div>
              <div className="mc-stats">
                {[
                  ['Poss', m.stats.poss],
                  ['Shots', m.stats.shots],
                  ['On Tgt', m.stats.onT],
                  ['Corners', m.stats.corners],
                  ['xG', m.stats.xg],
                ].map(([lbl, [a, b]]) => (
                  <div key={lbl} className="mc-stat">
                    <div className="stat-label">{lbl}</div>
                    <div className="stat-value">{a} · {b}</div>
                  </div>
                ))}
              </div>
              <div className="mc-weather">{m.weather}</div>
            </div>

            <div className="mc-right">
              <h4>Top markets</h4>
              {m.marketGroups.map((g) => (
                <div key={g.platform} className="market-group">
                  <a className="market-group-head" href={g.url} target="_blank" rel="noreferrer">
                    <span className="platform">{g.platform}</span>
                    <span className="platform-link">view all ↗</span>
                  </a>
                  <div className="market-tags">
                    {g.items.map((it) => (
                      <div key={it.q} className={'market-tag' + (it.hot ? ' hot' : '')}>
                        <a
                          className="tag-q tag-q-link"
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                          title={`Open on ${g.platform}`}
                        >
                          <span className="tag-q-text">{it.q}</span>
                          <span className="tag-q-ext" aria-hidden="true">↗</span>
                        </a>
                        <div className="tag-row">
                          <span className="tag-vol">{formatVol(it.volNum)}</span>
                          <div className="tag-options">
                            {it.options.map(([k, v]) => (
                              <span key={k} className="opt-chip">
                                <b className="opt-k">{k}</b>
                                <span className="opt-v">{v}%</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="tag-actions">
                          <button
                            className="tag-btn tag-btn-analyze"
                            onClick={() => navigate('/analysis/' + m.id, { state: { match: m, preAnalyze: { q: it.q, platform: g.platform } } })}
                          >
                            <span className="tag-btn-icon">▶</span> Start analysis
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                className="mc-ask"
                onClick={() => navigate('/analysis/' + m.id, { state: { match: m } })}
              >
                Ask AI about this match
              </button>
            </div>
          </article>
        ))}

        <h3 className="upcoming-heading">Upcoming</h3>
        <div className="upcoming-strip">
          {UPCOMING.map((u, i) => (
            <div key={i} className="upcoming-card" onClick={() => navigate('/analysis/demo', { state: { query: `${u.home.name} vs ${u.away.name}` } })}>
              <div className="countdown">{u.in}</div>
              <div className="teams">{u.home.flag} {u.home.name} <span style={{ color: 'var(--fg-dim)' }}>vs</span> {u.away.name} {u.away.flag}</div>
              <div className="upcoming-forms">
                <FormDots form={u.home.form} />
                <span className="vs-tiny">vs</span>
                <FormDots form={u.away.form} />
              </div>
              <div className="odds">Polymarket: {u.odds}</div>
              <div className="upcoming-meta">{u.h2h}</div>
              <div className="upcoming-meta">{u.weather} · {u.kickoff}</div>
            </div>
          ))}
        </div>

        <div className="history-header">
          <h3 className="upcoming-heading" style={{ marginTop: 0 }}>History</h3>
          <div className="history-summary">
            AI hit <span className="hit-rate">9 / 12</span> markets last 4 matches · 75% accuracy
          </div>
        </div>
        <div className="history-grid">
          {HISTORY.map((h) => (
            <div key={h.id} className="history-card-v2" onClick={() => navigate('/analysis/' + h.id, { state: { match: { ...h, league: 'World Cup 2026 · FT', status: 'finished', minute: "FT", h2h: '', lineup: 'Match completed', events: [], stats: { poss: ['—','—'], shots: ['—','—'], onT: ['—','—'], corners: ['—','—'], xg: ['—','—'] }, weather: '', marketGroups: [] } } })}>
              <div className="hist-head">
                <span className="hist-date">{h.date} · FT</span>
                <span className={'hist-badge hit-' + (h.aiSummary.hit === h.aiSummary.total ? 'all' : h.aiSummary.hit === 0 ? 'none' : 'partial')}>
                  AI {h.aiSummary.hit}/{h.aiSummary.total}
                </span>
              </div>
              <div className="hist-score-row">
                <span className="hist-team">{h.home.flag} {h.home.name}</span>
                <span className="hist-score">{h.home.score} : {h.away.score}</span>
                <span className="hist-team away">{h.away.name} {h.away.flag}</span>
              </div>
              <div className="hist-markets">
                {h.markets.map((m, i) => (
                  <div key={i} className="hist-market-row">
                    <span className={'hist-tick ' + (m.correct ? 'tick-ok' : 'tick-miss')}>{m.correct ? '✓' : '✗'}</span>
                    <div className="hist-mq">
                      <div className="hist-q">{m.q}</div>
                      <div className="hist-pred">
                        Pre-match AI <span className="hist-ai">{m.aiPre}</span> · actual <span className="hist-actual">{m.actual}</span>
                      </div>
                      {m.peak && <div className="hist-peak">↳ {m.peak}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
