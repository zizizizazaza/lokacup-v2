import { NavLink, Link } from 'react-router-dom'

export default function TopNav() {
  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <Link to="/" className="nav-brand">LokaCup</Link>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Tables
          </NavLink>
          <NavLink to="/forks" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            My Forks
          </NavLink>
        </div>
        <Link to="/open" className="nav-cta">Open table</Link>
      </div>
    </nav>
  )
}
