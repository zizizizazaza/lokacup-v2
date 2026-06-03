// Shared mute preference, persisted across sessions via localStorage.
// One key for the whole app — if the user mutes on the home page, the detail page
// also starts muted, and vice versa.

const KEY = 'lokacup:muted'

export function getInitialMuted() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch (e) {
    return false
  }
}

export function persistMuted(muted) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, muted ? '1' : '0')
  } catch (e) {
    /* private mode / quota — ignore */
  }
}
