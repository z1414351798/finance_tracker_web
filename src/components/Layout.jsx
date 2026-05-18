import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, History as HistoryIcon, LogOut, PlusCircle,
  ChartNoAxesCombinedIcon, Maximize2Icon, Building2Icon, User, RefreshCw,
  MoreHorizontal, Wallet, X, Moon, Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const { dark, toggleDark } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard',  path: '/dashboard',  icon: <LayoutDashboard size={22}/> },
    { name: 'Record',     path: '/record',      icon: <PlusCircle size={22}/> },
    { name: 'History',    path: '/history',     icon: <HistoryIcon size={22}/> },
    { name: 'Analytics',  path: '/analytics',   icon: <ChartNoAxesCombinedIcon size={22}/> },
    { name: 'Recurring',  path: '/recurring',   icon: <RefreshCw size={22}/> },
    { name: 'Nebula',     path: '/nebula',      icon: <Maximize2Icon size={22}/> },
    { name: 'Skyline',    path: '/financialSkyline', icon: <Building2Icon size={22}/> },
  ];

  // First 4 items in the bottom bar; 5th slot is "More"
  const mobileNavItems = navItems.slice(0, 4);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f172a]">

      {/* ═══════════════════════════════════
          Desktop sidebar  (lg and above)
      ═══════════════════════════════════ */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white p-6 flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Wallet size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
            FinanceTracker
          </h2>
        </div>

        {/* Nav links */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium text-sm ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-700/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        {/* Privacy / Terms footer links */}
        <div className="text-xs text-gray-500 text-center py-2">
          <Link to="/privacy" className="hover:text-gray-300 transition">Privacy Policy</Link>
          {' · '}
          <Link to="/terms" className="hover:text-gray-300 transition">Terms</Link>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800 transition-all duration-150 font-medium text-sm"
        >
          {dark ? <Sun size={20}/> : <Moon size={20}/>}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Bottom: Profile + Logout */}
        <div className="space-y-1 pt-4 border-t border-slate-800">
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium text-sm ${
              isActive('/profile')
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-700/30'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User size={20}/> Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 font-medium text-sm"
          >
            <LogOut size={20}/> Logout
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════
          Page content
          – adds bottom padding on mobile so
            content doesn't hide under the nav
      ═══════════════════════════════════ */}
      <main className="flex-1 min-w-0 overflow-y-auto lg:pb-0" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
        <Outlet />
      </main>

      {/* ═══════════════════════════════════
          Mobile bottom navigation bar
          (hidden on lg and above)
      ═══════════════════════════════════ */}
      <nav
        className="lg:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: 'var(--nav-bg)',
          borderTop: '1px solid var(--nav-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', height: '64px' }}>
          {mobileNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: active ? '#2563eb' : 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                <span style={{ color: active ? '#2563eb' : 'var(--text-muted)' }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* "More" button */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              fontSize: '10px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            <MoreHorizontal size={22} />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* ── Backdrop ── */}
      {moreDrawerOpen && (
        <div
          className="lg:hidden"
          onClick={() => setMoreDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            backgroundColor: 'rgba(0,0,0,0.35)',
          }}
        />
      )}

      {/* ── "More" slide-up drawer ── */}
      <div
        className="lg:hidden"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: `calc(64px + env(safe-area-inset-bottom, 0px))`,
          zIndex: 9999,
          backgroundColor: 'var(--drawer-bg)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          transform: moreDrawerOpen ? 'translateY(0)' : 'translateY(calc(100% + 80px))',
          transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
          visibility: moreDrawerOpen ? 'visible' : 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 12px', borderBottom: '1px solid var(--nav-border)' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>More</span>
          <button onClick={() => setMoreDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '12px' }}>
          <Link
            to="/profile"
            onClick={() => setMoreDrawerOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '500', textDecoration: 'none' }}
          >
            <User size={20} color="#3b82f6" /> Profile
          </Link>
          <button
            onClick={() => { toggleDark(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '500', border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}
          >
            {dark ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => { setMoreDrawerOpen(false); handleLogout(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#ef4444', fontWeight: '500', border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

    </div>
  );
}
