import { Menu, Search } from 'lucide-react';

export default function Topbar({ onMenuClick }) {
  return (
    <header className="h-14 bg-[#111113] border-b border-[#2a2a2f] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="text-zinc-500 text-sm hidden md:block">
          Portfolio Tracker
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Simple search icon for mobile placeholder */}
        <button className="md:hidden p-2 text-zinc-400">
          <Search size={18} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            G
          </div>
          <span className="text-white text-sm font-medium hidden sm:block">Guest</span>
        </div>
      </div>
    </header>
  );
}