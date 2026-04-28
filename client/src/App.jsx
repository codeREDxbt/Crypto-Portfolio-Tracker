import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Market from './pages/Market.jsx';
import Watchlist from './pages/Watchlist.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/market" element={<Market />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}