import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ProtectedRoute from './components/ProtectedRoute';
import Analytics from './pages/Analytics';
import Record from './pages/Record';
import Profile from './pages/Profile';
import Recurring from './pages/Recurring';
import NebulaPage from './pages/NebulaPage';
import FinancialSkylinePage from './pages/FinancialSkyline';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import CookieBanner from './components/CookieBanner';
import { useDarkMode } from './hooks/useDarkMode';
import { ThemeContext } from './context/ThemeContext';

function App() {
  const [dark, setDark] = useDarkMode();
  return (
    <ThemeContext.Provider value={{ dark, toggleDark: () => setDark(d => !d) }}>
      <Router>
        <CookieBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Protected Routes wrapped in Layout (Sidebar/Header) */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="history" element={<History />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="record" element={<Record />} />
            <Route path="profile" element={<Profile />} />
            <Route path="recurring" element={<Recurring />} />
            <Route path="/nebula" element={<NebulaPage />} />
            <Route path="/financialSkyline" element={<FinancialSkylinePage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}
export default App;
