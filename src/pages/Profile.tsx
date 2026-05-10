import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Settings, 
  Bookmark, 
  ChefHat, 
  Info, 
  Plus, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  Clock,
  Cloud,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { getUserRecipes } from '../services/recipeService';
import { Recipe } from '../types';

export const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getUserRecipes(user.uid)
        .then(setMyRecipes)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const stats = [
    { label: 'Recipes', value: myRecipes.length, icon: <ChefHat size={18} />, color: 'bg-brand-olive/10 text-brand-olive' },
    { label: 'Favorites', value: 8, icon: <Heart size={18} />, color: 'bg-brand-gold/10 text-brand-gold' },
    { label: 'Saved Plan', value: 3, icon: <Calendar size={18} />, color: 'bg-brand-olive/10 text-brand-olive' },
    { label: 'Groceries', value: 15, icon: <ShoppingCart size={18} />, color: 'bg-brand-olive/10 text-brand-olive' },
  ];

  const menuItems = [
    { icon: <User size={20} />, label: 'Account Details', action: () => {} },
    { icon: <Bookmark size={20} />, label: 'Saved Collections', action: () => {} },
    { icon: <Settings size={20} />, label: 'Preferences', action: () => {} },
    { icon: <Info size={20} />, label: 'System Information', action: () => navigate('/debug') },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <header className="flex flex-col items-center pt-4">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-[48px] overflow-hidden border-4 border-white shadow-xl p-1 bg-brand-cream/50 group transition-all hover:scale-105">
            <img 
              src={user?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop'} 
              alt={user?.displayName || 'Guest Chef'} 
              className="w-full h-full object-cover rounded-[40px]"
            />
          </div>
          <button className="absolute bottom-1 right-1 w-10 h-10 rounded-2xl bg-brand-olive text-white shadow-lg flex items-center justify-center border-4 border-white hover:bg-brand-olive/90 transition-colors">
            <Settings size={16} />
          </button>
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-serif text-gray-900">{user?.displayName || 'Guest Chef'}</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            {user ? user.email : 'Explore as guest'}
          </p>
        </div>

        {!user && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={login}
            className="mt-6 flex items-center gap-3 bg-brand-olive text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-brand-olive/20"
          >
            <Cloud size={16} />
            Sync with Cloud
          </motion.button>
        )}
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-2 gap-4 px-2">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-white rounded-[32px] border border-gray-100 shadow-sm space-y-3"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-gray-900">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Weekly Plan Card (Merged from Dashboard) */}
      <section className="px-2">
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => navigate('/plan')}
          className="bg-brand-olive text-white p-8 rounded-[40px] relative overflow-hidden shadow-xl shadow-brand-olive/20 cursor-pointer group"
        >
          <div className="relative z-10 space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Next on your menu</span>
              <h3 className="text-2xl font-serif">Weekly Schedule</h3>
              <p className="text-xs opacity-70">Check your planned meals for the week</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-full border border-white/10 group-hover:bg-white/20 transition-colors">
              Open Planner <ChevronRight size={14} />
            </div>
          </div>
          <TrendingUp size={140} className="absolute -right-8 -bottom-8 opacity-10 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0" />
        </motion.div>
      </section>

      {/* Mes Recettes Collection */}
      <section className="space-y-6 px-2">
        <div className="flex justify-between items-center px-4">
          <h3 className="font-serif text-2xl font-medium">My Cookbook</h3>
          <button 
            onClick={() => navigate('/create-recipe')}
            className="w-10 h-10 rounded-2xl bg-brand-olive/10 text-brand-olive flex items-center justify-center hover:bg-brand-olive hover:text-white transition-all transform hover:rotate-90"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            [1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-50 rounded-[32px] animate-pulse" />
            ))
          ) : myRecipes.length > 0 ? (
            myRecipes.slice(0, 3).map((recipe) => (
              <motion.div 
                key={recipe.id}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
                className="group bg-white p-3 rounded-[32px] border border-gray-100 flex items-center gap-4 hover:border-brand-olive/30 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-16 h-16 rounded-[24px] overflow-hidden shrink-0">
                  <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&fit=crop'} className="w-full h-full object-cover" alt={recipe.title} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-lg leading-tight truncate group-hover:text-brand-olive transition-colors">{recipe.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    <span className="flex items-center gap-1"><Clock size={10} /> {recipe.prepTime}m</span>
                    {recipe.isPublic && <span className="text-brand-olive/60">Public</span>}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-200 group-hover:text-brand-olive transition-colors">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-[40px] border border-dashed border-gray-200 space-y-4">
              <ChefHat size={40} className="mx-auto text-gray-300" />
              <p className="text-gray-400 text-sm">Your cookbook is empty</p>
              <button 
                onClick={() => navigate('/create-recipe')}
                className="text-[10px] font-bold text-brand-olive uppercase tracking-[0.2em] underline"
              >
                Create your first recipe
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Menu List */}
      <section className="px-2">
        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-xs">
          {menuItems.map((item, i) => (
            <button 
              key={i} 
              onClick={item.action}
              className="w-full flex items-center justify-between px-8 py-5 hover:bg-brand-cream/20 transition-colors border-b border-gray-50 last:border-0 group"
            >
              <div className="flex items-center gap-5">
                <div className="text-gray-400 group-hover:text-brand-olive transition-colors">{item.icon}</div>
                <span className="font-semibold text-gray-700 text-sm group-hover:text-gray-900 transition-colors">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-200 group-hover:text-brand-olive transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </section>

      {/* Logout / Login Footer */}
      <footer className="px-6">
        {user ? (
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 py-5 text-red-400 font-bold uppercase tracking-[0.2em] text-[10px] border border-red-50 rounded-[32px] hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Logout Session
          </button>
        ) : (
          <button 
            onClick={login}
            className="w-full flex items-center justify-center gap-3 py-5 text-brand-olive font-bold uppercase tracking-[0.2em] text-[10px] border border-brand-olive/10 rounded-[32px] hover:bg-brand-olive/5 transition-colors"
          >
            <User size={16} />
            Sign in with Account
          </button>
        )}
      </footer>
    </div>
  );
};
