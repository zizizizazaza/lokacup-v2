import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/tokens.css'
import './styles/v2.css'
import Shell from './components/Shell.jsx'
import TablesListPage from './pages/v2/TablesListPage.jsx'
import TableRoomPage from './pages/v2/TableRoomPage.jsx'
import OpenTablePage from './pages/v2/OpenTablePage.jsx'
import CampaignPage from './pages/v2/CampaignPage.jsx'
import ProfilePage from './pages/v2/ProfilePage.jsx'

// NOTE: StrictMode is intentionally NOT used here. It double-mounts components in dev,
// which causes two simultaneous speechSynthesis intervals to run for Coach Mike /
// PresenterBar — making mute appear "broken" because the invisible second instance
// keeps queueing utterances. Production builds don't have this issue, but for a clean
// dev experience we leave it off.
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Shell>
      <Routes>
        <Route path="/" element={<TablesListPage />} />
        <Route path="/table/:id" element={<TableRoomPage />} />
        <Route path="/open" element={<OpenTablePage />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Shell>
  </BrowserRouter>,
)
