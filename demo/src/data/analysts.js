// Single source of truth for the AI analyst roster.
// LokaCup offers 6 analyst agents — users pick which ones to invite to their Table.
//
// Used across: top members bar, chat thread labels, Main analysis tabs, Manage modal.

export const ANALYSTS = [
  {
    key: 'news',
    name: 'News Analyst',
    short: 'News',
    specialty: 'Lineups, injuries, referee, news wires',
    tags: ['Lineups', 'Injuries', 'Wires'],
    glyph: '📰',
    tone: 'coral',
    image: '/news-agent.png',
    defaultActive: true,
  },
  {
    key: 'tactics',
    name: 'Tactics Analyst',
    short: 'Tactics',
    specialty: 'Formations, pressing, momentum reads',
    tags: ['Formations', 'Press'],
    glyph: '⚽',
    tone: 'cyan',
    image: '/tactics-agent.png',
    defaultActive: true,
  },
  {
    key: 'history',
    name: 'History Analyst',
    short: 'History',
    specialty: 'Head-to-head, past performance, ELO',
    tags: ['H2H', 'ELO', 'Form'],
    glyph: '📊',
    tone: 'mint',
    image: '/history-agent.png',
    defaultActive: true,
  },
  {
    key: 'market',
    name: 'Market Analyst',
    short: 'Market',
    specialty: 'Polymarket / Kalshi flow, whale prints',
    tags: ['Order flow', 'Edge'],
    glyph: '📈',
    tone: 'gold',
    defaultActive: true,
  },
  {
    key: 'diviner',
    name: 'I Ching Diviner',
    short: 'Diviner',
    specialty: 'Traditional I Ching divination — trigrams, hexagrams, omens',
    tags: ['I Ching', 'Trigrams', 'Omens'],
    glyph: '☯',
    tone: 'violet',
    image: '/diviner.png',
    defaultActive: false,
  },
  {
    key: 'crowd',
    name: 'Crowd Sentiment',
    short: 'Crowd',
    specialty: 'Twitter / Reddit / Discord chatter and bias',
    tags: ['Social', 'Sentiment'],
    glyph: '🗣',
    tone: 'amber',
    defaultActive: false,
  },
]

export const ANALYST_BY_NAME = Object.fromEntries(
  ANALYSTS.flatMap((a) => [[a.name, a], [a.short, a], [a.key, a]])
)

// Legacy ↔ canonical mapping (older mocks used 'Stats'/'Odds'/'News'/'Tactics')
export const LEGACY_AGENT_TO_NAME = {
  Stats: 'History Analyst',
  Odds: 'Market Analyst',
  News: 'News Analyst',
  Tactics: 'Tactics Analyst',
}
