// Lightweight auth store backed by localStorage. No real backend — sign-in flows
// just stash a user object and dispatch a 'lokacup:auth' event so listeners refresh.

const KEY = 'lokacup:user'
const EVENT = 'lokacup:auth'

export function getUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) { return null }
}

export function setUser(user) {
  try {
    if (user) window.localStorage.setItem(KEY, JSON.stringify(user))
    else window.localStorage.removeItem(KEY)
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch (e) {}
}

export function logout() { setUser(null) }

// Hook: subscribe to changes (storage events + same-tab updates)
import { useEffect, useState } from 'react'
export function useAuth() {
  const [user, setLocal] = useState(() => getUser())
  useEffect(() => {
    const refresh = () => setLocal(getUser())
    window.addEventListener('storage', refresh)
    window.addEventListener(EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(EVENT, refresh)
    }
  }, [])
  return { user, isAuthed: !!user, setUser, logout }
}

// Fake sign-in helpers — each returns a user record.
const SAMPLE_NAMES = ['Mika', 'Jordan', 'Riley', 'Sky', 'Alex', 'Robin', 'Nova', 'Sam']
const pickName = () => SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)]

export function signInWith(method, payload = {}) {
  const base = {
    id: 'u_' + Math.random().toString(36).slice(2, 10),
    method,
    joinedAt: new Date().toISOString(),
    points: 0,
    tier: 'Rookie',
  }
  let u
  if (method === 'google')  u = { ...base, name: payload.name || `${pickName()}@gmail`, email: payload.email || 'demo@gmail.com', avatar: '🟢' }
  else if (method === 'twitter') u = { ...base, name: payload.handle || '@' + pickName().toLowerCase(), handle: payload.handle || '@demo', avatar: '🐦' }
  else if (method === 'email')   u = { ...base, name: payload.email?.split('@')[0] || pickName(), email: payload.email, avatar: '✉️' }
  else if (method === 'wallet')  u = { ...base, name: payload.address ? short(payload.address) : '0x8f2a…c19d', address: payload.address || '0x8f2acafd71b3...c19d', avatar: '◆' }
  else u = { ...base, name: pickName(), avatar: '👤' }
  setUser(u)
  return u
}

function short(a) { return a.slice(0, 6) + '…' + a.slice(-4) }

// True if the avatar is an uploaded image (data URL or http URL) vs an emoji/glyph
export function isImageAvatar(avatar) {
  return typeof avatar === 'string' && (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.startsWith('/'))
}

// Return a single-character glyph for fallback when no image is set
export function avatarGlyph(user) {
  const a = user?.avatar
  if (a && !isImageAvatar(a) && a.length <= 2) return a
  const name = user?.name || 'U'
  return name.replace(/^[@◆0x]+/, '').slice(0, 1).toUpperCase()
}
