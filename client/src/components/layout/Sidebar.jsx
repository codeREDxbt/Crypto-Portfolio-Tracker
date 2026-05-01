import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, TrendingUp, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { to: '/market', icon: TrendingUp, label: 'Market' },
  { to: '/watchlist', icon: Star, label: 'Watchlist' },
];

export default function Sidebar({ isCollapsed, onCollapse }) {
  return (
    <aside className="h-full bg-[#111113] border-r border-[#2a2a2f] flex flex-col transition-all duration-300">
      {/* Logo Section */}
      <div className={`p-4 border-b border-[#2a2a2f] flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
        <div className="min-w-[24px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
            <path d="M16 8l2-2"/>
            <path d="M8 16l-2 2"/>
          </svg>
        </div>
        {!isCollapsed && (
          <h1 className="text-white text-lg font-semibold truncate">
            CryptoTracker
          </h1>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={isCollapsed ? label : ''}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
          >
            <div className="min-w-[18px]">
              <Icon size={18} />
            </div>
            {!isCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop Only) */}
      <div className="p-3 border-t border-[#2a2a2f] hidden lg:block">
        <button
          onClick={onCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-[#18181b] transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}