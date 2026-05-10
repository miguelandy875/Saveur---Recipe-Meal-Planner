import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Bookmark, ChefHat, Info, Plus } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { motion } from 'motion/react';

export const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-8 text-center px-6">
        <div className="w-24 h-24 bg-brand-olive/10 rounded-[32px] flex items-center justify-center mb-4">
          <ChefHat size={48} className="text-brand-olive" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-serif italic text-gray-900">Join Saveur</h1>
          <p className="text-gray-500 max-w-[280px]">Sign in to save recipes, plan your week, and access your personal cookbook.</p>
        </div>
        <button 
          onClick={login}
          className="btn-olive w-full max-w-xs flex items-center justify-center gap-3 py-4"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  const menuItems = [
    { icon: <User size={20} />, label: 'My Profile', color: 'text-blue-500' },
    { icon: <Bookmark size={20} />, label: 'Favorites', color: 'text-brand-gold' },
    { icon: <ChefHat size={20} />, label: 'My Recipes', color: 'text-orange-500' },
    { icon: <Info size={20} />, label: 'System Check', color: 'text-brand-olive', action: () => navigate('/debug') },
    { icon: <Settings size={20} />, label: 'Settings', color: 'text-gray-500' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-[40px] overflow-hidden border-4 border-white shadow-lg p-1 bg-brand-olive/10">
            <img 
              src={user.photoURL || ''} 
              alt={user.displayName || 'User'} 
              className="w-full h-full object-cover rounded-[34px]"
            />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-olive text-white shadow-md flex items-center justify-center border-2 border-white">
            <Settings size={14} />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-serif">{user.displayName}</h1>
          <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">{user.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-100 flex flex-col items-center gap-1">
          <span className="text-2xl font-serif text-brand-olive">24</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Favorites</span>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-xs border border-gray-100 flex flex-col items-center gap-1">
          <span className="text-2xl font-serif text-brand-olive">12</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Recipes</span>
        </div>
      </div>

      <button 
        onClick={() => navigate('/create-recipe')}
        className="w-full bg-brand-olive text-white rounded-3xl py-4 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs shadow-lg shadow-brand-olive/20"
      >
        <Plus size={18} />
        New Recipe
      </button>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xs">
        {menuItems.map((item, i) => (
          <button 
            key={i} 
            onClick={item.action}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-4">
              <div className={`${item.color} opacity-80`}>{item.icon}</div>
              <span className="font-semibold text-gray-700 text-sm">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        ))}
      </div>

      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-3 py-4 text-red-500 font-bold uppercase tracking-widest text-xs border border-red-100 rounded-3xl hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
