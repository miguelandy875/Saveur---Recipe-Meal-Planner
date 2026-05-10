import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, ShoppingBag, User, LayoutDashboard } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="mobile-container">
      <main className="px-4 pt-6 pb-24">
        {children}
      </main>
      
      <nav className="bottom-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-brand-olive' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Board</span>
        </NavLink>

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
