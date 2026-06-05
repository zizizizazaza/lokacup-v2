import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, logout, isImageAvatar, avatarGlyph } from '../lib/auth.js'
import LoginModal from './LoginModal.jsx'

// Top-nav account control. Logged-out → opens LoginModal.
// Logged-in → username chip with dropdown (Profile, Logout).
export default function UserMenu() {
  const { user, isAuthed } = useAuth()
  const [openLogin, setOpenLogin] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  // Close dropdown on outside click / escape
  useEffect(() => {
    if (!openMenu) return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenMenu(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpenMenu(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenu])

  if (!isAuthed) {
    return (
      <>
        <button type="button" className="nav-user nav-user-button" onClick={() => setOpenLogin(true)}>
          <span className="nav-user-avatar" />
          <span>Sign in</span>
        </button>
        {openLogin && <LoginModal onClose={() => setOpenLogin(false)} />}
      </>
    )
  }

  const displayName = user.name || 'You'
  // For wallet addresses, show the very compact form: 0x## … #### (10 chars total).
  // Anything else (real names, @handles, emails) is shown as-is.
  const isAddress = /^0x[0-9a-fA-F]{6,}$/.test(displayName)
  const navName = isAddress
    ? displayName.slice(0, 4) + '…' + displayName.slice(-4)
    : displayName
  const avatarIsImg = isImageAvatar(user.avatar)
  const avatarChar  = avatarGlyph(user)

  return (
    <div className="nav-user-wrap" ref={ref}>
      <button
        type="button"
        className={'nav-user nav-user-button' + (openMenu ? ' is-open' : '')}
        onClick={() => setOpenMenu((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={openMenu}
      >
        <span className={'nav-user-avatar nav-user-avatar-glyph' + (avatarIsImg ? ' nav-user-avatar-img' : '')}>
          {avatarIsImg ? <img src={user.avatar} alt="" /> : avatarChar}
        </span>
        <span className="nav-user-name">{navName}</span>
        <span className="nav-user-points" title={`${(user.points && user.points > 0 ? user.points : 1245).toLocaleString()} points`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2 14.6 8.6 21.5 9.3 16.3 13.9 17.9 20.7 12 17.1 6.1 20.7 7.7 13.9 2.5 9.3 9.4 8.6Z"/>
          </svg>
          {(user.points && user.points > 0 ? user.points : 1245).toLocaleString()}
        </span>
        <svg className={'nav-user-chev' + (openMenu ? ' is-open' : '')} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {openMenu && (
        <div className="user-menu" role="menu">
          <div className="user-menu-head">
            <div className={'user-menu-avatar' + (avatarIsImg ? ' user-menu-avatar-img' : '')}>
              {avatarIsImg ? <img src={user.avatar} alt="" /> : avatarChar}
            </div>
            <div className="user-menu-id">
              <div className="user-menu-name">{displayName}</div>
              <div className="user-menu-meta">
                {user.method === 'google'  && (user.email || 'Google account')}
                {user.method === 'twitter' && (user.handle || 'X account')}
                {user.method === 'email'   && user.email}
                {user.method === 'wallet'  && (user.address || 'Web3 wallet')}
              </div>
            </div>
          </div>

          <Link to="/profile" className="user-menu-item" role="menuitem" onClick={() => setOpenMenu(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
            </svg>
            <span>Profile</span>
          </Link>

          <button
            type="button"
            className="user-menu-item user-menu-item-danger"
            role="menuitem"
            onClick={() => { logout(); setOpenMenu(false); navigate('/') }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  )
}
