import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, History as HistoryIcon, LogOut, CirclePlusIcon, ChartNoAxesCombinedIcon, Maximize2Icon, Building2Icon } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Record', path: '/record', icon: <HistoryIcon size={20}/> },
    { name: 'History', path: '/history', icon: <CirclePlusIcon size={20}/> },
    { name: 'Analytics', path: '/analytics', icon: <ChartNoAxesCombinedIcon size={20}/> },
    { name: 'Nebula', path: '/nebula', icon: <Maximize2Icon size={20}/> },
    { name: 'FinancialSkyline', path: '/financialSkyline', icon: <Building2Icon size={20}/> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
        <h2 className="text-2xl font-bold mb-8 text-blue-400">FinancePro</h2>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-400 hover:text-red-300">
          <LogOut size={20}/> Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}