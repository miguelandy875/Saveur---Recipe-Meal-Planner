import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Calendar, ChefHat, ClipboardList, Heart, House, Search, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../services/AuthContext';
import { useI18n } from '../../services/i18n';
import { LanguageSwitcher } from '../LanguageSwitcher';

const navItems = [
  { to: '/', labelKey: 'nav.home', icon: House },
  { to: '/catalog', labelKey: 'nav.catalog', icon: Search },
  { to: '/plan', labelKey: 'nav.planner', icon: Calendar },
  { to: '/groceries', labelKey: 'nav.groceries', icon: ShoppingBag },
] as const;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <div className="app-container">
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 min-h-20 flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-6 gap-y-3 py-3">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-xl bg-brand-olive flex items-center justify-center text-white transition-transform group-hover:rotate-6 shadow-sm">
              <ChefHat size={23} />
            </div>
            <div>
              <span className="font-serif italic text-2xl font-bold tracking-wide text-brand-olive leading-none">Saveur</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mt-1">{t('app.tagline')}</p>
            </div>
          </Link>

          <nav className="order-3 w-full lg:order-none lg:w-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative h-10 px-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors after:absolute after:left-1 after:right-1 after:bottom-1 after:h-0.5 after:rounded-full after:bg-brand-olive after:transition-opacity ${
                      isActive ? 'text-brand-olive' : 'text-gray-500 hover:text-brand-olive'
                    } ${isActive ? 'after:opacity-100' : 'after:opacity-0'}`
                  }
                >
                  <Icon size={17} strokeWidth={2} />
                  {t(item.labelKey)}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <LanguageSwitcher compact />
            <Link
              to="/profile"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white text-brand-olive focus:outline-none focus:ring-2 focus:ring-brand-olive/30"
              aria-label={user?.displayName ? `${t('nav.profile')}: ${user.displayName}` : t('nav.signIn')}
            >
              <div className="w-9 h-9 rounded-full bg-brand-olive/10 text-brand-olive flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : user ? (
                  <Heart size={17} />
                ) : (
                  <ClipboardList size={17} />
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        {children}
      </main>
    </div>
  );
};
