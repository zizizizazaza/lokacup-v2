import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, logout, setUser, isImageAvatar, avatarGlyph } from '../../lib/auth.js'
import { TABLES } from '../../data/tables.js'
import { TableCard } from './TablesListPage.jsx'
import WinShareModal from '../../components/WinShareModal.jsx'
import { flagSrc } from '../../components/Flag.jsx'

// Mock predictions — covers pending/won/lost across multi-outcome and binary markets
const MOCK_PREDICTIONS = [
  { tableId: 'bra-mar-winner',     outcomeId: 'bra',     stakedAt: '23m',  status: 'pending' },
  { tableId: 'fra-can-mbappe',     outcomeId: 'a',       stakedAt: '2h',   status: 'won' },
  { tableId: 'esp-mar-tomorrow',   outcomeId: 'b',       stakedAt: '1d',   status: 'lost' },
  { tableId: 'eng-bel-firsthalf',  outcomeId: 'eng',     stakedAt: '4h',   status: 'pending' },
  { tableId: 'golden-boot',        outcomeId: 'mbappe',  stakedAt: '3d',   status: 'pending' },
  { tableId: 'wc-winner-brazil',   outcomeId: 'a',       stakedAt: '5h',   status: 'won' },
]

const MOCK_MY_TABLE_IDS = ['fra-can-mbappe', 'eng-bel-firsthalf']

export default function ProfilePage() {
  const { user, isAuthed } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('predictions')
  const [predFilter, setPredFilter] = useState('all') // all | pending | won | lost
  const [copied, setCopied] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  if (!isAuthed) return <Navigate to="/" replace />

  const displayName = user.name || 'You'
  const avatarIsImg = isImageAvatar(user.avatar)
  const avatarChar  = avatarGlyph(user)

  const subId = user.email || user.handle || user.address || ''
  const points = (user.points && user.points > 0) ? user.points : 1245

  const predictions = MOCK_PREDICTIONS.map((p) => {
    const t = TABLES.find((tab) => tab.id === p.tableId)
    if (!t) return null
    let outcomeLabel, outcomeProb, tone
    if (t.market.outcomes) {
      const o = t.market.outcomes.find((x) => x.id === p.outcomeId)
      outcomeLabel = o?.label || p.outcomeId
      outcomeProb  = t.market.probs?.[p.outcomeId] ?? 0
      tone = o?.tone || 'gray'
    } else {
      outcomeLabel = p.outcomeId === 'a' ? 'Yes' : 'No'
      outcomeProb  = p.outcomeId === 'a' ? t.market.aiConsensus : 100 - t.market.aiConsensus
      tone = p.outcomeId === 'a' ? 'a' : 'b'
    }
    const pointsAtStake = Math.round(25 * (outcomeProb > 65 ? 1.0 : outcomeProb > 40 ? 2.0 : outcomeProb > 20 ? 2.5 : 3.0))
    return { ...p, table: t, outcomeLabel, outcomeProb, tone, pointsAtStake }
  }).filter(Boolean)

  const myTables = MOCK_MY_TABLE_IDS.map((id) => TABLES.find((t) => t.id === id)).filter(Boolean)

  const wonCount  = predictions.filter((p) => p.status === 'won').length
  const lostCount = predictions.filter((p) => p.status === 'lost').length
  const settled   = wonCount + lostCount
  const winRate   = settled ? Math.round((wonCount / settled) * 100) : 0

  const filteredPreds = predFilter === 'all'
    ? predictions
    : predictions.filter((p) => p.status === predFilter)

  const copyId = async () => {
    if (!subId) return
    try {
      await navigator.clipboard.writeText(subId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {}
  }

  return (
    <div className="profilev2">
      {/* ─── Hero ─── */}
      <header className="pv-hero">
        <div className="pv-hero-glow" aria-hidden />
        <div className="pv-hero-inner">
          <div className="pv-hero-left">
            <div className={'pv-avatar' + (avatarIsImg ? ' pv-avatar-img' : '')}>
              {avatarIsImg ? <img src={user.avatar} alt="" /> : avatarChar}
            </div>
            <div className="pv-id">
              <div className="pv-name-row">
                <h1 className="pv-name">{displayName}</h1>
                <button
                  type="button"
                  className="pv-edit-btn"
                  onClick={() => setEditOpen(true)}
                  aria-label="Edit profile"
                  title="Edit profile"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                  Edit
                </button>
              </div>
              {subId && (
                <button type="button" className="pv-addr-chip" onClick={copyId} title="Copy">
                  <span className="pv-addr">{shortAddr(subId)}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {copied && <span className="pv-addr-copied">Copied</span>}
                </button>
              )}
            </div>
          </div>

          <div className="pv-points-block">
            <div className="pv-points-label">Total points</div>
            <div className="pv-points-num">{points.toLocaleString()}</div>
            <div className="pv-points-sub">
              <span className="pv-rank">Rank #1,284</span>
            </div>
          </div>
        </div>

        <div className="pv-stats">
          <div className="pv-stat">
            <div className="pv-stat-num">{predictions.length}</div>
            <div className="pv-stat-label">Predictions</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-num">{wonCount}</div>
            <div className="pv-stat-label">Won</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-num">{lostCount}</div>
            <div className="pv-stat-label">Lost</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-num">{settled ? winRate + '%' : '—'}</div>
            <div className="pv-stat-label">Win rate</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-num">{myTables.length}</div>
            <div className="pv-stat-label">Tables opened</div>
          </div>
        </div>
      </header>

      {/* ─── Tabs ─── */}
      <nav className="pv-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'predictions'}
          className={'pv-tab' + (tab === 'predictions' ? ' is-active' : '')}
          onClick={() => setTab('predictions')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-7"/></svg>
          My Predictions
          <span className="pv-tab-count">{predictions.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'tables'}
          className={'pv-tab' + (tab === 'tables' ? ' is-active' : '')}
          onClick={() => setTab('tables')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>
          My Tables
          <span className="pv-tab-count">{myTables.length}</span>
        </button>
      </nav>

      {/* ─── Tab panes ─── */}
      {tab === 'predictions' && (
        <section className="pv-pane">
          <div className="pv-filter-row">
            {[
              { k: 'all',     label: 'All',     n: predictions.length },
              { k: 'pending', label: 'Pending', n: predictions.filter((p) => p.status === 'pending').length },
              { k: 'won',     label: 'Won',     n: wonCount },
              { k: 'lost',    label: 'Lost',    n: lostCount },
            ].map((f) => (
              <button
                key={f.k}
                className={'pv-chip' + (predFilter === f.k ? ' is-active' : '') + ' pv-chip-' + f.k}
                onClick={() => setPredFilter(f.k)}
              >
                {f.label}
                <span className="pv-chip-count">{f.n}</span>
              </button>
            ))}
          </div>

          {filteredPreds.length ? (
            <div className="pv-grid">
              {filteredPreds.map((p, i) => (
                <PredictionCard key={i} p={p} onOpen={() => navigate(`/table/${p.tableId}`)} />
              ))}
            </div>
          ) : (
            <div className="pv-empty">
              <div className="pv-empty-icon">🎯</div>
              <div className="pv-empty-title">No predictions here</div>
              <div className="pv-empty-sub">Browse live tables to lock in your first one.</div>
              <Link to="/" className="pv-empty-cta">Browse tables →</Link>
            </div>
          )}
        </section>
      )}

      {editOpen && (
        <EditProfileModal user={user} onClose={() => setEditOpen(false)} />
      )}

      {tab === 'tables' && (
        <section className="pv-pane">
          {myTables.length ? (
            <div className="tables-grid">
              {myTables.map((t, i) => (
                <TableCard key={t.id} t={t} idx={i} />
              ))}
            </div>
          ) : (
            <div className="pv-empty">
              <div className="pv-empty-icon">🏟️</div>
              <div className="pv-empty-title">You haven't opened a table yet</div>
              <div className="pv-empty-sub">Spin up your own prediction room with the AI team.</div>
              <Link to="/open" className="pv-empty-cta">Open your first table →</Link>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function EditProfileModal({ user, onClose }) {
  const [name, setName]   = useState(user.name || '')
  const [avatar, setAvatar] = useState(user.avatar || '👤')
  const [uploadErr, setUploadErr] = useState('')

  const onUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-uploading same file
    if (!file) return
    if (!file.type.startsWith('image/')) { setUploadErr('Please pick an image file.'); return }
    if (file.size > 2 * 1024 * 1024)    { setUploadErr('Image must be under 2MB.');   return }
    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(reader.result)
      setUploadErr('')
    }
    reader.onerror = () => setUploadErr('Could not read that file.')
    reader.readAsDataURL(file)
  }
  const avatarIsImg = isImageAvatar(avatar)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const save = () => {
    setUser({ ...user, name: name.trim() || user.name, avatar })
    onClose()
  }

  // Linked accounts — show whichever sign-in method was used, read-only
  const linked = []
  if (user.method === 'google')  linked.push({ provider: 'Google',  value: user.email,   color: '#ea4335' })
  if (user.method === 'twitter') linked.push({ provider: 'X',       value: user.handle,  color: '#fff' })
  if (user.method === 'email')   linked.push({ provider: 'Email',   value: user.email,   color: '#a8ff00' })
  if (user.method === 'wallet')  linked.push({ provider: 'Wallet',  value: user.address, color: '#f5b400' })

  return createPortal((
    <div className="ep-backdrop" onClick={onClose}>
      <div className="ep-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="ep-close" type="button" aria-label="Close" onClick={onClose}>×</button>

        <h2 className="ep-title">Edit profile</h2>
        <p className="ep-sub">Update how you appear across LokaCup.</p>

        {/* Avatar — click the preview to upload an image */}
        <section className="ep-section ep-avatar-section">
          <label className="ep-upload-tile">
            <input type="file" accept="image/*" onChange={onUpload} hidden />
            <div className={'ep-avatar-preview' + (avatarIsImg ? ' is-img' : '')}>
              {avatarIsImg
                ? <img src={avatar} alt="" />
                : (avatar && avatar.length <= 2
                    ? avatar
                    : (name || 'U').replace(/^[@◆0x]+/, '').slice(0, 1).toUpperCase())}
              <div className="ep-upload-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>{avatarIsImg ? 'Change photo' : 'Upload photo'}</span>
              </div>
            </div>
          </label>
          <div className="ep-upload-hint">PNG or JPG · up to 2MB</div>
          {uploadErr && <div className="ep-upload-err">{uploadErr}</div>}
        </section>

        {/* Display name */}
        <section className="ep-section">
          <label className="ep-label" htmlFor="ep-name">Display name</label>
          <input
            id="ep-name"
            className="ep-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={32}
          />
          <div className="ep-hint">{name.length}/32</div>
        </section>

        {/* Linked accounts — read only */}
        <section className="ep-section">
          <label className="ep-label">Linked accounts</label>
          <div className="ep-linked-list">
            {linked.length ? linked.map((l) => (
              <div key={l.provider} className="ep-linked-row">
                <div className="ep-linked-icon" style={{ color: l.color }}>
                  {l.provider === 'Google' && (
                    <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  )}
                  {l.provider === 'X' && (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2H21.5l-7.49 8.564L23 22h-6.844l-5.36-7.013L4.66 22H1.4l8.02-9.17L1 2h7.02l4.84 6.4L18.244 2z"/></svg>
                  )}
                  {l.provider === 'Email' && (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                  )}
                  {l.provider === 'Wallet' && (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V8a2 2 0 0 0-2-2H5a2 2 0 1 1 0-4h14"/><path d="M3 6v12a2 2 0 0 0 2 2h16v-4"/><circle cx="17" cy="14" r="1.5" fill="currentColor"/></svg>
                  )}
                </div>
                <div className="ep-linked-info">
                  <div className="ep-linked-provider">{l.provider}</div>
                  <div className="ep-linked-value">{l.value || '—'}</div>
                </div>
              </div>
            )) : (
              <div className="ep-linked-empty">No accounts linked.</div>
            )}
          </div>
          <p className="ep-fineprint">Linked accounts are read-only here. Manage them in your account settings.</p>
        </section>

        <div className="ep-actions">
          <button type="button" className="ep-btn ep-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="ep-btn ep-btn-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  ), document.body)
}

function shortAddr(s) {
  if (!s) return ''
  if (s.length <= 16) return s
  return s.slice(0, 6) + '…' + s.slice(-4)
}

function ShareButton({ label = 'Share' }) {
  const onClick = (e) => {
    e.stopPropagation()
    // Stub — image generation lands later. For now just flash feedback.
    const t = e.currentTarget
    const prev = t.getAttribute('data-state') || ''
    t.setAttribute('data-state', 'flash')
    setTimeout(() => t.setAttribute('data-state', prev), 800)
  }
  return (
    <button type="button" className="pv-share" aria-label={label} title={label} onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    </button>
  )
}

function PredictionCard({ p, onOpen }) {
  const t = p.table
  const outcomes = t.market.outcomes
    ? t.market.outcomes.map((o) => ({ id: o.id, label: o.label, prob: t.market.probs?.[o.id] ?? 0 }))
    : [
        { id: 'a', label: 'Yes', prob: t.market.aiConsensus },
        { id: 'b', label: 'No',  prob: 100 - t.market.aiConsensus },
      ]
  const statusLabel = { pending: 'Pending', won: 'Won', lost: 'Lost' }[p.status]

  const visible = outcomes.length > 4
    ? [outcomes.find((o) => o.id === p.outcomeId), ...outcomes.filter((o) => o.id !== p.outcomeId).slice(0, 2)].filter(Boolean)
    : outcomes
  const hidden = outcomes.length - visible.length

  // Build the data WinShareModal needs.
  // For finished tables we know the real winning side; otherwise we feature the user's pick.
  const myPickLabel = outcomes.find((o) => o.id === p.outcomeId)?.label || p.outcomeLabel
  const winningId   = t.winningOutcomeId || p.outcomeId
  const winningLabel = outcomes.find((o) => o.id === winningId)?.label || myPickLabel
  const winningFlag = (t.market.outcomes?.find((o) => o.id === winningId)?.flag) || null
  const flagUrl = winningFlag ? `https://flagcdn.com/${winningFlag}.svg` : flagSrc(winningLabel)

  const [shareOpen, setShareOpen] = useState(false)
  const openShare = (e) => {
    e.stopPropagation()
    setShareOpen(true)
  }
  const shareLabel = p.status === 'won'
    ? 'Share my win'
    : p.status === 'lost'
      ? 'Share result'
      : 'Share my pick'

  return (
    <>
      <div
        className={'pv-pred pv-pred-' + p.status}
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}
      >
        <div className="pv-pred-head">
          <span className="pv-pred-title">{t.market.title}</span>
          <span className={'pv-pred-badge pv-pred-badge-' + p.status}>
            {p.status === 'won'  && <span className="pv-pred-badge-icon">✓</span>}
            {p.status === 'lost' && <span className="pv-pred-badge-icon">✕</span>}
            {p.status === 'pending' && <span className="pv-pred-pulse" />}
            {statusLabel}
          </span>
        </div>

        <div className="pv-pred-meta">
          <span>{t.league}</span>
          <span className="pv-pred-meta-dot">·</span>
          <span>{p.stakedAt} ago</span>
        </div>

        <div className="pv-pred-outcomes">
          {visible.map((o) => {
            const picked = o.id === p.outcomeId
            return (
              <div
                key={o.id}
                className={'pv-pred-out' + (picked ? ' is-picked is-picked-' + p.status : '')}
              >
                <span className="pv-pred-out-mark">{picked ? '✓' : ''}</span>
                <span className="pv-pred-out-label">{o.label}</span>
                <span className="pv-pred-out-bar">
                  <span className="pv-pred-out-fill" style={{ width: `${o.prob}%` }} />
                </span>
                <span className="pv-pred-out-prob">{o.prob}%</span>
              </div>
            )
          })}
          {hidden > 0 && (
            <div className="pv-pred-more">+ {hidden} more outcome{hidden > 1 ? 's' : ''}</div>
          )}
        </div>

        <div className="pv-pred-foot">
          {p.status === 'won'     && <span className="pv-pred-reward pv-pred-reward-win">+{p.pointsAtStake} pts</span>}
          {p.status === 'lost'    && <span className="pv-pred-reward pv-pred-reward-lose">0 pts</span>}
          {p.status === 'pending' && <span className="pv-pred-reward">+{p.pointsAtStake} pts if correct</span>}
          <span className="pv-pred-cta">Open table →</span>
        </div>

        <button
          type="button"
          className="pv-pred-share-btn"
          onClick={openShare}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          {shareLabel}
        </button>
      </div>

      {shareOpen && (
        <WinShareModal
          table={t}
          winningLabel={winningLabel}
          flag={flagUrl}
          myPickLabel={myPickLabel}
          pts={p.pointsAtStake}
          status={p.status}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  )
}
