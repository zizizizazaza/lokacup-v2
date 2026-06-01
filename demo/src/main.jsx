import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/tokens.css'
import TopNav from './components/TopNav.jsx'
import AskPage from './pages/AskPage.jsx'
import MatchesPage from './pages/MatchesPage.jsx'
import AnalysisPage from './pages/AnalysisPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="bg-stadium" />
      <div className="bg-grid" />
      <TopNav />
      <Routes>
        <Route path="/" element={<AskPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/analysis/:id" element={<AnalysisPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
