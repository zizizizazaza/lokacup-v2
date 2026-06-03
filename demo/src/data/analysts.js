// Single source of truth for the AI analyst team.
// Used across: right-rail team card, chat thread agent labels, Main analysis tab.

export const ANALYSTS = [
  {
    key: 'stats',
    name: 'Stats Analyst',
    short: 'Stats',
    specialty: 'Live xG, possession, shot quality',
    tags: ['xG', 'Possession', 'Models'],
    glyph: '📊',
    tone: 'mint',
  },
  {
    key: 'market',
    name: 'Market Analyst',
    short: 'Market',
    specialty: 'Polymarket / Kalshi flow, whale prints',
    tags: ['Order flow', 'Edge'],
    glyph: '📈',
    tone: 'gold',
  },
  {
    key: 'news',
    name: 'News Analyst',
    short: 'News',
    specialty: 'Lineups, injuries, referee, news wires',
    tags: ['Lineups', 'Injuries'],
    glyph: '📰',
    tone: 'coral',
  },
  {
    key: 'tactics',
    name: 'Tactics Analyst',
    short: 'Tactics',
    specialty: 'Formations, press, momentum reads',
    tags: ['Press', 'Shape'],
    glyph: '⚽',
    tone: 'cyan',
  },
]

export const ANALYST_BY_NAME = Object.fromEntries(
  ANALYSTS.flatMap((a) => [[a.name, a], [a.short, a], [a.key, a]])
)

// Legacy ↔ canonical mapping, since older mocks used 'Stats'/'Odds'/'News'/'Tactics'
export const LEGACY_AGENT_TO_NAME = {
  Stats: 'Stats Analyst',
  Odds: 'Market Analyst',
  News: 'News Analyst',
  Tactics: 'Tactics Analyst',
}
