import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Calendar, ChefHat, ClipboardList, Heart, LayoutDashboard, Search, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../services/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/catalog', label: 'Catalog', icon: Search },
  { to: '/plan', label: 'Planner', icon: Calendar },
  { to: '/groceries', label: 'Groceries', icon: ShoppingBag },
  { to: '/profile', label: 'Account', icon: User },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 min-h-20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 md:py-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-brand-olive flex items-center justify-center text-white transition-transform group-hover:rotate-6 shadow-sm">
              <ChefHat size={23} />
            </div>
            <div>
              <span className="font-serif italic text-2xl font-bold tracking-wide text-brand-olive leading-none">Saveur</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mt-1">Recipe Planner</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `h-11 px-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                      isActive ? 'bg-brand-olive text-white' : 'text-gray-500 hover:bg-brand-cream hover:text-brand-olive'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <Link
            to={user ? '/profile' : '/profile'}
            className="hidden lg:flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-2 text-sm shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-olive/10 text-brand-olive flex items-center justify-center">
              {user ? <Heart size={16} /> : <ClipboardList size={16} />}
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-gray-800">{user?.displayName || 'Sign in'}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">{user?.role || 'Required'}</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        {children}
      </main>
    </div>
  );
};
