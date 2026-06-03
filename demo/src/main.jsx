import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/tokens.css'
import './styles/v2.css'
import Shell from './components/Shell.jsx'
import TablesListPage from './pages/v2/TablesListPage.jsx'
import TableRoomPage from './pages/v2/TableRoomPage.jsx'
import ForkPage from './pages/v2/ForkPage.jsx'
import OpenTablePage from './pages/v2/OpenTablePage.jsx'
import MyForksPage from './pages/v2/MyForksPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="bg-grid" />
      <Shell>
        <Routes>
          <Route path="/" element={<TablesListPage />} />
          <Route path="/table/:id" element={<TableRoomPage />} />
          <Route path="/fork/:id" element={<ForkPage />} />
          <Route path="/open" element={<OpenTablePage />} />
          <Route path="/forks" element={<MyForksPage />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  </StrictMode>,
)
