// Module-level singleton lock for the speechSynthesis API.
// At most one presenter component (Coach Mike on home, or PresenterBar on detail page)
// can hold the lock at any time. Anyone else stays silent.
//
// Why this exists: React StrictMode, HMR module reloads, or accidental double-mounts
// can otherwise create two intervals each calling speechSynthesis.speak() — the user
// hears two voices and the mute button only silences the visible instance.

let holderId = null
let nextId = 1

export function acquireVoice() {
  const id = nextId++
  // First in wins. Already held → caller is a duplicate and gets a no-op token.
  if (holderId === null) {
    holderId = id
    return { id, ok: true, release: () => { if (holderId === id) holderId = null } }
  }
  return { id, ok: false, release: () => {} }
}

export function hasVoiceLock(id) {
  return holderId === id
}
