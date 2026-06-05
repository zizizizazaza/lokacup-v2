import { useEffect, useMemo, useState } from 'react'

// Football pitch view. Two layouts:
//   - vertical   (default, taller than wide; legacy use in the rail)
//   - horizontal (TV broadcast view; used inside BasicDataTabs)

const HOME = {
  shortName: 'BRA',
  color: '#facc15',
  textColor: '#0a0a10',
  gk: 'Alisson',
  def: ['Danilo', 'Marquinhos', 'T. Silva', 'A. Sandro'],
  mid: ['Casemiro', 'Bruno', 'Lucas'],
  att: ['Raphinha', 'Neymar', 'Vinícius'],
}
const AWAY = {
  shortName: 'FLD',
  color: '#7cc3ff',
  textColor: '#0a0a10',
  gk: 'Field GK',
  def: ['Field RB', 'Field CB', 'Field CB', 'Field LB'],
  mid: ['Field CDM', 'Field CM', 'Field CM'],
  att: ['Field RW', 'Field ST', 'Field LW'],
}

const EVENT_STREAM = [
  { playerId: 'home-lw',  kind: 'goal',   text: 'Vinícius scored · 58′' },
  { playerId: 'home-cdm', kind: 'yellow', text: 'Casemiro booked · 62′' },
  { playerId: 'away-st',  kind: 'shot',   text: 'Field ST hit the post · 65′' },
  { playerId: 'home-st',  kind: 'sub',    text: 'Neymar warming up · 67′' },
  { playerId: 'home-rw',  kind: 'shot',   text: 'Raphinha forced a save · 70′' },
  { playerId: 'away-cm1', kind: 'yellow', text: 'Field CM booked · 73′' },
]

function eventBadgeColor(kind) {
  switch (kind) {
    case 'goal':   return '#a8ff00'
    case 'yellow': return '#facc15'
    case 'red':    return '#d91c1c'
    case 'shot':   return '#00e5ff'
    case 'sub':    return '#a78bfa'
    default:       return '#fff'
  }
}
function eventBadgeGlyph(kind) {
  switch (kind) {
    case 'goal':   return '⚽'
    case 'yellow':
    case 'red':    return '▮'
    case 'shot':   return '!'
    case 'sub':    return '↻'
    default:       return ''
  }
}

// Vertical layout: pitch 100 wide × 150 tall. Home defends bottom, away defends top.
function lineupVertical(team, side) {
  const flipY = side === 'home' ? (y) => 150 - y : (y) => y
  return [
    { id: team.shortName + '-gk',  pos: 'GK',  name: team.gk,    x: 50, y: flipY(8)  },
    { id: team.shortName + '-rb',  pos: 'RB',  name: team.def[0], x: 82, y: flipY(28) },
    { id: team.shortName + '-cb1', pos: 'CB',  name: team.def[1], x: 62, y: flipY(30) },
    { id: team.shortName + '-cb2', pos: 'CB',  name: team.def[2], x: 38, y: flipY(30) },
    { id: team.shortName + '-lb',  pos: 'LB',  name: team.def[3], x: 18, y: flipY(28) },
    { id: team.shortName + '-cdm', pos: 'CDM', name: team.mid[0], x: 50, y: flipY(48) },
    { id: team.shortName + '-cm1', pos: 'CM',  name: team.mid[1], x: 72, y: flipY(50) },
    { id: team.shortName + '-cm2', pos: 'CM',  name: team.mid[2], x: 28, y: flipY(50) },
    { id: team.shortName + '-rw',  pos: 'RW',  name: team.att[0], x: 80, y: flipY(67) },
    { id: team.shortName + '-st',  pos: 'ST',  name: team.att[1], x: 50, y: flipY(70) },
    { id: team.shortName + '-lw',  pos: 'LW',  name: team.att[2], x: 20, y: flipY(67) },
  ]
}

// Horizontal layout: pitch 160 wide × 100 tall. Home defends left goal, away defends right.
function lineupHorizontal(team, side) {
  const flipX = side === 'home' ? (x) => x : (x) => 160 - x
  return [
    { id: team.shortName + '-gk',  pos: 'GK',  name: team.gk,    x: flipX(8),  y: 50 },
    { id: team.shortName + '-rb',  pos: 'RB',  name: team.def[0], x: flipX(22), y: 18 },
    { id: team.shortName + '-cb1', pos: 'CB',  name: team.def[1], x: flipX(24), y: 38 },
    { id: team.shortName + '-cb2', pos: 'CB',  name: team.def[2], x: flipX(24), y: 62 },
    { id: team.shortName + '-lb',  pos: 'LB',  name: team.def[3], x: flipX(22), y: 82 },
    { id: team.shortName + '-cdm', pos: 'CDM', name: team.mid[0], x: flipX(42), y: 50 },
    { id: team.shortName + '-cm1', pos: 'CM',  name: team.mid[1], x: flipX(44), y: 28 },
    { id: team.shortName + '-cm2', pos: 'CM',  name: team.mid[2], x: flipX(44), y: 72 },
    { id: team.shortName + '-rw',  pos: 'RW',  name: team.att[0], x: flipX(62), y: 20 },
    { id: team.shortName + '-st',  pos: 'ST',  name: team.att[1], x: flipX(65), y: 50 },
    { id: team.shortName + '-lw',  pos: 'LW',  name: team.att[2], x: flipX(62), y: 80 },
  ]
}

function PlayerDot({ p, team, isActive, eventKind }) {
  return (
    <g className={'lp-player' + (isActive ? ' is-active' : '') + (eventKind ? ' has-event' : '')}>
      {isActive && (
        <circle className="lp-pulse-ring" cx={p.x} cy={p.y} r="5.5"
                fill="none" stroke={team.color} strokeWidth="1" />
      )}
      <circle className="lp-dot" cx={p.x} cy={p.y} r="3.8"
              fill={team.color} stroke="rgba(0,0,0,0.5)" strokeWidth="0.6" />
      <text x={p.x} y={p.y + 1.3} textAnchor="middle"
            fontSize="3.4" fontWeight="800" fill={team.textColor}
            fontFamily="system-ui, sans-serif" pointerEvents="none">
        {p.pos}
      </text>
      <text x={p.x} y={p.y + 9} textAnchor="middle"
            fontSize="2.8" fill="#fff"
            fontFamily="system-ui, sans-serif" pointerEvents="none">
        {p.name}
      </text>
      {eventKind && (
        <g transform={`translate(${p.x + 5},${p.y - 5})`}>
          <circle cx="0" cy="0" r="2.5" fill={eventBadgeColor(eventKind)} />
          <text x="0" y="1" textAnchor="middle" fontSize="3.2" fill="#0a0a10" fontWeight="900">
            {eventBadgeGlyph(eventKind)}
          </text>
        </g>
      )}
    </g>
  )
}

export default function LivePitch({ orientation = 'vertical' }) {
  const isHorizontal = orientation === 'horizontal'
  const homePlayers = useMemo(() => (isHorizontal ? lineupHorizontal : lineupVertical)(HOME, 'home'), [isHorizontal])
  const awayPlayers = useMemo(() => (isHorizontal ? lineupHorizontal : lineupVertical)(AWAY, 'away'), [isHorizontal])

  const [eventIdx, setEventIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setEventIdx((i) => (i + 1) % EVENT_STREAM.length), 3500)
    return () => clearInterval(id)
  }, [])
  const currentEvent = EVENT_STREAM[eventIdx]

  const renderTeam = (players, team, prefix) =>
    players.map((p) => {
      const fullId = prefix + '-' + p.id.split('-').pop()
      const isActive = currentEvent.playerId === fullId
      return (
        <PlayerDot
          key={p.id}
          p={p}
          team={team}
          isActive={isActive}
          eventKind={isActive ? currentEvent.kind : null}
        />
      )
    })

  const W = isHorizontal ? 160 : 100
  const H = isHorizontal ? 100 : 150

  return (
    <div className={'lp' + (isHorizontal ? ' lp-h' : '')}>
      <div className="lp-head">
        <span className="lp-head-title">Live formations</span>
        <span className="lp-head-meta">
          <span className="lp-head-team home"><i style={{ background: HOME.color }} /> {HOME.shortName}</span>
          <span className="lp-head-vs">2 — 1</span>
          <span className="lp-head-team away"><i style={{ background: AWAY.color }} /> {AWAY.shortName}</span>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="lp-pitch" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lp-grass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"  stopColor="#1a4a1f" />
            <stop offset="50%" stopColor="#216826" />
            <stop offset="100%" stopColor="#1a4a1f" />
          </linearGradient>
          {/* Stripes — horizontal pitch uses horizontal stripes, vertical pitch uses vertical */}
          {isHorizontal ? (
            <pattern id="lp-stripes" x="0" y="0" width={W} height="10" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width={W} height="5" fill="rgba(255,255,255,0.025)" />
            </pattern>
          ) : (
            <pattern id="lp-stripes" x="0" y="0" width="10" height={H} patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="5" height={H} fill="rgba(255,255,255,0.025)" />
            </pattern>
          )}
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#lp-grass)" rx="2" />
        <rect x="0" y="0" width={W} height={H} fill="url(#lp-stripes)" rx="2" />

        {/* White lines */}
        <g fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.4">
          <rect x="1.5" y="1.5" width={W - 3} height={H - 3} rx="1" />
          {isHorizontal ? (
            <>
              {/* Halfway line (vertical) */}
              <line x1={W / 2} y1="1.5" x2={W / 2} y2={H - 1.5} />
              {/* Center circle */}
              <circle cx={W / 2} cy={H / 2} r="10" />
              <circle cx={W / 2} cy={H / 2} r="0.8" fill="rgba(255,255,255,0.65)" />
              {/* Left penalty area */}
              <rect x="1.5" y="30" width="15" height="40" />
              <rect x="1.5" y="42" width="6"  height="16" />
              {/* Right penalty area */}
              <rect x={W - 16.5} y="30" width="15" height="40" />
              <rect x={W - 7.5}  y="42" width="6"  height="16" />
              {/* Goals */}
              <rect x="-1"        y="44" width="2.5" height="12" fill="rgba(255,255,255,0.18)" />
              <rect x={W - 1.5}   y="44" width="2.5" height="12" fill="rgba(255,255,255,0.18)" />
              {/* Penalty arcs */}
              <path d={`M 16.5 41 A 9 9 0 0 1 16.5 59`} />
              <path d={`M ${W - 16.5} 41 A 9 9 0 0 0 ${W - 16.5} 59`} />
            </>
          ) : (
            <>
              <line x1="1.5" y1="75" x2="98.5" y2="75" />
              <circle cx="50" cy="75" r="9" />
              <circle cx="50" cy="75" r="0.8" fill="rgba(255,255,255,0.65)" />
              <rect x="25" y="1.5" width="50" height="15" />
              <rect x="38" y="1.5" width="24" height="6" />
              <rect x="25" y="133.5" width="50" height="15" />
              <rect x="38" y="142.5" width="24" height="6" />
              <rect x="44" y="-1" width="12" height="2.5" fill="rgba(255,255,255,0.18)" />
              <rect x="44" y="148.5" width="12" height="2.5" fill="rgba(255,255,255,0.18)" />
              <path d="M 41 16.5 A 9 9 0 0 0 59 16.5" />
              <path d="M 41 133.5 A 9 9 0 0 1 59 133.5" />
            </>
          )}
        </g>

        {renderTeam(awayPlayers, AWAY, 'away')}
        {renderTeam(homePlayers, HOME, 'home')}
      </svg>

      <div className="lp-caption">
        <span className={'lp-caption-dot lp-caption-' + currentEvent.kind} />
        <span className="lp-caption-text">{currentEvent.text}</span>
      </div>
    </div>
  )
}
