import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChefHat,
  ChevronRight,
  Clock,
  Heart,
  LogOut,
  Plus,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../services/AuthContext';
import { getDashboardStats } from '../services/dashboardService';
import { getFavoriteRecipes, getUserRecipes } from '../services/recipeService';
import { DashboardStats, Recipe } from '../types';

const emptyStats: DashboardStats = {
  recipes: 0,
  favorites: 0,
  plannedMeals: 0,
  groceryItems: 0,
};

export const Profile: React.FC = () => {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('chef@saveur.local');
  const [password, setPassword] = useState('saveur123');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([getUserRecipes(user.uid), getFavoriteRecipes(), getDashboardStats()])
      .then(([recipes, favorites, dashboardStats]) => {
        setMyRecipes(recipes);
        setFavoriteRecipes(favorites);
        setStats(dashboardStats);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      if (authMode === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_1.1fr] gap-8 items-start">
        <section className="bg-brand-olive text-white rounded-2xl p-8 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <ChefHat size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] opacity-70">Authentication</p>
            <h1 className="text-4xl font-serif mt-2">Saveur Account</h1>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">
            The lecturer brief asks for authenticated users, password hashing and user-specific favorites, recipes and meal plans.
          </p>
          <div className="bg-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            Demo login:
            <br />
            Email: chef@saveur.local
            <br />
            Password: saveur123
          </div>
        </section>

        <form onSubmit={handleAuth} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest ${
                authMode === 'login' ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest ${
                authMode === 'register' ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400'
              }`}
            >
              Register
            </button>
          </div>

          {authMode === 'register' && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
            minLength={6}
            required
          />

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}

          <button type="submit" className="w-full btn-olive h-12">
            {authMode === 'register' ? 'Create account' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  const statCards = [
    { label: 'Recipes', value: stats.recipes, icon: <ChefHat size={18} /> },
    { label: 'Favorites', value: stats.favorites, icon: <Heart size={18} /> },
    { label: 'Planned', value: stats.plannedMeals, icon: <Calendar size={18} /> },
    { label: 'Groceries', value: stats.groceryItems, icon: <ShoppingCart size={18} /> },
  ];

  const menuItems = [
    { icon: <Search size={20} />, label: 'Browse catalog', action: () => navigate('/catalog') },
    { icon: <Calendar size={20} />, label: 'Open meal planner', action: () => navigate('/plan') },
    { icon: <ShoppingCart size={20} />, label: 'Generate grocery list', action: () => navigate('/groceries') },
  ];

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-brand-olive/10 text-brand-olive flex items-center justify-center">
            <User size={34} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{user.role}</p>
            <h1 className="text-3xl font-serif text-gray-900">{user.displayName}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="h-12 px-5 border border-red-100 rounded-xl text-red-500 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-50"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-olive/10 text-brand-olive">
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-gray-900">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-2xl font-medium">My Cookbook</h3>
            <button
              onClick={() => navigate('/create-recipe')}
              className="w-10 h-10 rounded-xl bg-brand-olive/10 text-brand-olive flex items-center justify-center hover:bg-brand-olive hover:text-white transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="grid gap-3">
            {loading ? (
              [1, 2, 3].map((item) => <div key={item} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)
            ) : myRecipes.length > 0 ? (
              myRecipes.slice(0, 5).map((recipe) => (
                <RecipeRow key={recipe.id} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.id}`)} />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-4">
                <ChefHat size={40} className="mx-auto text-gray-300" />
                <p className="text-gray-400 text-sm">Your cookbook is empty</p>
                <button onClick={() => navigate('/create-recipe')} className="text-[10px] font-bold text-brand-olive uppercase tracking-[0.2em] underline">
                  Create your first recipe
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-serif text-2xl font-medium">Favorites</h3>
          <div className="grid gap-3">
            {favoriteRecipes.length > 0 ? (
              favoriteRecipes.slice(0, 4).map((recipe) => (
                <RecipeRow key={recipe.id} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.id}`)} />
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-500">
                Favorite recipes will appear here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center justify-between px-6 py-5 hover:bg-brand-cream/40 transition-colors border-b border-gray-50 last:border-0 group"
          >
            <div className="flex items-center gap-4">
              <div className="text-gray-400 group-hover:text-brand-olive transition-colors">{item.icon}</div>
              <span className="font-semibold text-gray-700 text-sm group-hover:text-gray-900 transition-colors">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-200 group-hover:text-brand-olive" />
          </button>
        ))}
      </section>
    </div>
  );
};

const RecipeRow: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => (
  <button
    onClick={onClick}
    className="group bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-brand-olive/30 transition-all cursor-pointer shadow-sm text-left"
  >
    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
      <img
        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&fit=crop'}
        className="w-full h-full object-cover"
        alt={recipe.title}
      />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-serif text-lg leading-tight truncate group-hover:text-brand-olive transition-colors">{recipe.title}</h4>
      <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
        <span className="flex items-center gap-1">
          <Clock size={10} /> {recipe.prepTime + recipe.cookTime}m
        </span>
        {recipe.isPublic && <span className="text-brand-olive/60">Public</span>}
      </div>
    </div>
    <ChevronRight size={20} className="text-gray-200 group-hover:text-brand-olive" />
  </button>
);
