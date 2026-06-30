import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Search, Calendar, ShoppingBag, User, ChefHat } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-container">
      {/* Premium Desktop Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-olive flex items-center justify-center text-white transition-transform group-hover:rotate-6 shadow-sm">
              <ChefHat size={22} />
            </div>
            <span className="font-serif italic text-2xl font-bold tracking-wide text-brand-olive">Saveur</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => `relative py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-brand-olive' : 'text-gray-400 hover:text-brand-olive/80'}`}
            >
              {({ isActive }) => (
                <span className="relative py-1">
                  Home
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-olive rounded-full" />
                  )}
                </span>
              )}
            </NavLink>
            
            <NavLink 
              to="/catalog" 
              className={({ isActive }) => `relative py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-brand-olive' : 'text-gray-400 hover:text-brand-olive/80'}`}
            >
              {({ isActive }) => (
                <span className="relative py-1">
                  Catalog
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-olive rounded-full" />
                  )}
                </span>
              )}
            </NavLink>
            
            <NavLink 
              to="/plan" 
              className={({ isActive }) => `relative py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-brand-olive' : 'text-gray-400 hover:text-brand-olive/80'}`}
            >
              {({ isActive }) => (
                <span className="relative py-1">
                  Planner
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-olive rounded-full" />
                  )}
                </span>
              )}
            </NavLink>
            
            <NavLink 
              to="/groceries" 
              className={({ isActive }) => `relative py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-brand-olive' : 'text-gray-400 hover:text-brand-olive/80'}`}
            >
              {({ isActive }) => (
                <span className="relative py-1">
                  Cart
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-olive rounded-full" />
                  )}
                </span>
              )}
            </NavLink>
            
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `relative py-2 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-brand-olive' : 'text-gray-400 hover:text-brand-olive/80'}`}
            >
              {({ isActive }) => (
                <span className="relative py-1">
                  Profile
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-olive rounded-full" />
                  )}
                </span>
              )}
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Responsive Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 pb-28 md:pb-16">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-brand-olive' : 'text-gray-400'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
        </NavLink>
        
        <NavLink 
          to="/catalog" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-brand-olive' : 'text-gray-400'}`}
        >
          <Search size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Catalog</span>
        </NavLink>
        
        <NavLink 
          to="/plan" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-brand-olive' : 'text-gray-400'}`}
        >
          <Calendar size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Planner</span>
        </NavLink>
        
        <NavLink 
          to="/groceries" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-brand-olive' : 'text-gray-400'}`}
        >
          <ShoppingBag size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Cart</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-brand-olive' : 'text-gray-400'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};
