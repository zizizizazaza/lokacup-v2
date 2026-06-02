const MAP = {
  argentina: 'ar', brazil: 'br', mexico: 'mx', usa: 'us', england: 'gb-eng', morocco: 'ma',
  spain: 'es', germany: 'de', deu: 'de', bra: 'br', arg: 'ar', france: 'fr', portugal: 'pt',
  belgium: 'be', uruguay: 'uy', netherlands: 'nl', canada: 'ca', italy: 'it', japan: 'jp',
  korea: 'kr', croatia: 'hr', switzerland: 'ch', sui: 'ch',
}

export function flagSrc(team) {
  if (!team) return null
  const code = MAP[team.toLowerCase()]
  return code ? `https://flagcdn.com/w40/${code}.png` : null
}

export default function Flag({ team, size = 16 }) {
  const src = flagSrc(team)
  if (!src) return null
  return <img className="flag" alt="" src={src} style={{ height: size, width: Math.round(size * 1.4) }} />
}

// Replace standalone country names in a string with flag-prefixed spans
export function withFlags(text) {
  if (!text) return text
  const re = new RegExp('\\b(' + Object.keys(MAP).filter(k => k.length > 3).join('|') + ')\\b', 'gi')
  const parts = []
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(<span key={i++} className="inline-team"><Flag team={m[1]} /> {m[1]}</span>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : text
}
