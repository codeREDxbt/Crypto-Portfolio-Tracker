import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, TrendingUp, Star } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/market', icon: TrendingUp, label: 'Market' },
  { to: '/watchlist', icon: Star, label: 'Watchlist' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-[#111113] border-r border-[#2a2a2f] flex flex-col">
      <div className="p-4 border-b border-[#2a2a2f]">
        <h1 className="text-white text-lg font-semibold flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
            <path d="M16 8l2-2"/>
            <path d="M8 16l-2 2"/>
          </svg>
          CryptoTracker
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}