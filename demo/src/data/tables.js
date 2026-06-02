// Mock data for v2 betting tables prototype.

export const ME_HANDLE = '0x8f2a…c19d'

const aiMsg = (text, meta) => ({ role: 'ai', text, meta, ts: Date.now() })
const hostMsg = (text) => ({ role: 'host', text, ts: Date.now() })
const sysEvt = (text) => ({ role: 'system', text, ts: Date.now() })

export const TABLES = [
  {
    id: 'bra-mar-winner',
    isOfficial: true,
    host: { handle: 'LokaCup AI', emoji: '🤖' },
    market: {
      title: 'Brazil vs Morocco — match winner',
      platform: 'Polymarket',
      url: 'https://polymarket.com/event/brazil-vs-morocco',
      currentPrice: 68,
      aiConsensus: 71,
      edge: 3,
      volume24h: '$1.2M',
    },
    league: 'Group D · MetLife Stadium',
    status: 'live',
    spectatorCount: 47,
    forkCount: 8,
    summary: 'Casemiro doubt may move the line, but xG strongly favors Brazil…',
    messages: [
      sysEvt("⚽ 23' Neymar scored — Brazil 1, Morocco 0"),
      hostMsg("First analysis — Brazil opened at 58%, now 68%. What's the AI consensus?"),
      aiMsg(
        "Synthesizing 4 agents: Data 73% (high) · Market 68% (med) · News 70% (high, Neymar confirmed fit) · Tactics 72% (med). Consensus: 71%, +3pt edge over Polymarket.",
        'Block 01 · Snapshot'
      ),
      sysEvt("⚽ 41' Hakimi scored — Brazil 1, Morocco 1"),
      hostMsg('Morocco equalized — does the consensus shift?'),
      aiMsg(
        "Yes, slight pullback. Data agent recalibrates to 68% (was 73%). Market agent unchanged at 68%. News agent flags Achraf's set-piece efficiency. Tactics agent notes BRA midfield press is leaking. New consensus: 67%.",
        'Block 02 · Recalibration'
      ),
      sysEvt("⚽ 58' Vinicius scored — Brazil 2, Morocco 1"),
      hostMsg('Brazil retook the lead. What now?'),
      aiMsg(
        "Strong swing. Data: 75% · Market: 68% · News: 73% · Tactics: 74%. Consensus 73%. Polymarket lags at 68% — edge widens to +5pt.",
        'Block 03 · Edge widens'
      ),
      hostMsg("What if Casemiro gets subbed off?"),
      aiMsg(
        "Probability drops to ~64%. Casemiro shields the back-4 from Morocco's counter — without him, BRA midfield is more porous against Ziyech.",
        'Block 04 · Scenario'
      ),
    ],
    spectators: [
      { handle: '0xA1c3…b27e', joinedAgo: '4m' },
      { handle: '0xB244…1f89', joinedAgo: '6m' },
      { handle: '0x91dd…0f4a', joinedAgo: '8m' },
      { handle: '0xCC02…91bb', joinedAgo: '12m' },
      { handle: '0x71ab…ddc1', joinedAgo: '14m' },
    ],
  },
  {
    id: 'fra-can-mbappe',
    isOfficial: false,
    host: { handle: '0x7e44…aa12', emoji: '👤' },
    market: {
      title: 'Mbappé to score 2+ vs Canada',
      platform: 'Polymarket',
      url: 'https://polymarket.com/event/mbappe-2plus',
      currentPrice: 38,
      aiConsensus: 45,
      edge: 7,
      volume24h: '$310k',
    },
    league: 'Group D · Toronto',
    status: 'live',
    spectatorCount: 31,
    forkCount: 5,
    summary: 'Pace suggests 1.6 expected — value buy at 38%…',
    messages: [
      hostMsg('Mbappé already scored at 18\'. Polymarket has him at 38% for a brace. AI?'),
      aiMsg(
        "Live pace puts expected goals for Mbappé at ~1.6. Implied 2+ probability is ~45%. Polymarket price 38% — looks like a +7pt value buy.",
        'Block 01 · Edge'
      ),
      hostMsg("Risk if he gets subbed at 70'?"),
      aiMsg(
        "Conditional drop. If subbed at 70', probability falls to ~28% (window cut short). Deschamps' usual pattern: subs Mbappé in blowouts only after 75'.",
        'Block 02 · Risk'
      ),
    ],
    spectators: [
      { handle: '0x12fc…aa88', joinedAgo: '2m' },
      { handle: '0x9b13…11de', joinedAgo: '5m' },
    ],
  },
  {
    id: 'wc-winner-brazil',
    isOfficial: true,
    host: { handle: 'LokaCup AI', emoji: '🤖' },
    market: {
      title: 'Brazil to win the World Cup',
      platform: 'Polymarket',
      url: 'https://polymarket.com/event/world-cup-winner-2026',
      currentPrice: 18,
      aiConsensus: 21,
      edge: 3,
      volume24h: '$2.3M',
    },
    league: 'Tournament outright',
    status: 'live',
    spectatorCount: 89,
    forkCount: 14,
    summary: 'Bracket draw and Vinicius form make 18% look cheap…',
    messages: [
      hostMsg('Polymarket prices Brazil at 18% to win it all. Reasonable?'),
      aiMsg(
        "AI consensus 21%. Bracket analysis: Brazil's projected path avoids France until the final. Form: +3 in last 5, xG diff +1.4. Slight edge to YES.",
        'Block 01 · Outright snapshot'
      ),
    ],
    spectators: Array.from({ length: 7 }, (_, i) => ({
      handle: '0x' + Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6),
      joinedAgo: `${i * 3 + 1}m`,
    })),
  },
  {
    id: 'esp-mar-tomorrow',
    isOfficial: true,
    host: { handle: 'LokaCup AI', emoji: '🤖' },
    market: {
      title: 'Spain vs Morocco — total goals 2.5 over',
      platform: 'Polymarket',
      url: 'https://polymarket.com/event/spain-morocco-totals',
      currentPrice: 64,
      aiConsensus: 58,
      edge: -6,
      volume24h: '$540k',
    },
    league: 'Group F · Tomorrow 15:00',
    status: 'live',
    spectatorCount: 18,
    forkCount: 2,
    summary: 'Historic low-scoring matchups; market may be overconfident…',
    messages: [
      hostMsg('Polymarket has Over 2.5 at 64% for SPA vs MAR. Justified?'),
      aiMsg(
        "AI consensus 58% — Over is overpriced. H2H last 5 averaged 1.6 goals. Morocco's bus defense + Spain's tiki-taka low-scoring tendency = sub-2.5 likely.",
        'Block 01 · Fade the over'
      ),
    ],
    spectators: [
      { handle: '0x4422…ee01', joinedAgo: '1m' },
      { handle: '0xff03…aabb', joinedAgo: '3m' },
    ],
  },
  {
    id: 'eng-bel-firsthalf',
    isOfficial: false,
    host: { handle: '0xff03…aabb', emoji: '👤' },
    market: {
      title: 'England vs Belgium — first half winner',
      platform: 'Polymarket',
      url: 'https://polymarket.com/event/eng-bel-firsthalf',
      currentPrice: 38,
      aiConsensus: 42,
      edge: 4,
      volume24h: '$210k',
    },
    league: 'Group E · Tomorrow',
    status: 'live',
    spectatorCount: 12,
    forkCount: 1,
    summary: 'England fast starters historically; +4pt value…',
    messages: [
      hostMsg('England 38% to lead at HT. Their first-half record this year?'),
      aiMsg(
        "ENG led at HT in 7 of last 10 competitive matches. Tuchel's pressing system targets early goals. AI puts ENG HT lead at 42% — slight value.",
        'Block 01 · Pattern'
      ),
    ],
    spectators: [
      { handle: '0xee99…0001', joinedAgo: '30s' },
    ],
  },
  {
    id: 'arg-uru-btts',
    isOfficial: true,
    host: { handle: 'LokaCup AI', emoji: '🤖' },
    market: {
      title: 'Argentina vs Uruguay — both teams to score',
      platform: 'Polymarket',
      url: 'https://polymarket.com/event/arg-uru-btts',
      currentPrice: 73,
      aiConsensus: 76,
      edge: 3,
      volume24h: '$320k',
    },
    league: 'Group A · Tomorrow',
    status: 'live',
    spectatorCount: 22,
    forkCount: 3,
    summary: 'Both have leaky defenses; +3pt on BTTS Yes…',
    messages: [
      hostMsg("How likely is BTTS in ARG vs URU?"),
      aiMsg(
        "AI consensus 76%. Both defenses have conceded in 8 of last 10. ARG xG-against 1.1, URU 1.3. Polymarket 73% — value buy.",
        'Block 01 · BTTS likely'
      ),
    ],
    spectators: Array.from({ length: 6 }, (_, i) => ({
      handle: '0x' + Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6),
      joinedAgo: `${i * 2 + 1}m`,
    })),
  },
  {
    id: 'usa-pry-arb',
    isOfficial: true,
    host: { handle: 'LokaCup AI', emoji: '🤖' },
    market: {
      title: 'USA to advance from Group — cross-platform arb',
      platform: 'Polymarket × Kalshi',
      url: 'https://polymarket.com/event/usa-advance',
      currentPrice: 42,
      aiConsensus: 47,
      edge: 5,
      volume24h: '$680k',
      isArb: true,
      arbSpread: 4.2,
    },
    league: 'Group F · Group stage',
    status: 'live',
    spectatorCount: 56,
    forkCount: 11,
    summary: 'Polymarket YES 42% vs Kalshi NO 53.8% → 4.2% spread…',
    messages: [
      hostMsg('Polymarket YES 42% but Kalshi NO 53.8%. Is there arb?'),
      aiMsg(
        "Net spread 4.2% after fees. Best execution: buy YES on Polymarket + buy NO on Kalshi. Lock guaranteed return regardless of outcome. Liquidity OK for ~$5k.",
        'Block 01 · Arb path'
      ),
    ],
    spectators: Array.from({ length: 8 }, (_, i) => ({
      handle: '0x' + Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6),
      joinedAgo: `${i + 1}m`,
    })),
  },
  {
    id: 'golden-boot',
    isOfficial: true,
    host: { handle: 'LokaCup AI', emoji: '🤖' },
    market: {
      title: 'Golden Boot — Mbappé',
      platform: 'Polymarket',
      url: 'https://polymarket.com/event/golden-boot',
      currentPrice: 22,
      aiConsensus: 19,
      edge: -3,
      volume24h: '$480k',
    },
    league: 'Tournament prop',
    status: 'live',
    spectatorCount: 34,
    forkCount: 7,
    summary: 'Mbappé 22% looks slightly rich; Haaland gaining…',
    messages: [
      hostMsg('Polymarket has Mbappé at 22% for top scorer. Fair?'),
      aiMsg(
        "AI consensus 19%. Mbappé's expected France path means 6 matches max. Vinicius (4 goals in 5) and Haaland (3 in 4) are closing the gap. Slight fade on Mbappé.",
        'Block 01 · Race tightening'
      ),
    ],
    spectators: Array.from({ length: 6 }, (_, i) => ({
      handle: '0x' + Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6),
      joinedAgo: `${i * 2}m`,
    })),
  },
]

export function getTable(id) {
  return TABLES.find((t) => t.id === id)
}

export const MY_FORKS = [
  {
    id: 'fork-cas-out',
    sourceTableId: 'bra-mar-winner',
    sourceHost: 'LokaCup AI',
    sourceMarket: 'Brazil vs Morocco — match winner',
    forkedAt: 'msg #6',
    isPublished: false,
    createdAgo: '12m',
    lastMessage: 'What if Casemiro gets subbed off at 70?',
  },
]
