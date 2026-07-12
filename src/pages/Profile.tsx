import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Bookmark,
  ChefHat,
  ChevronRight,
  Clock,
  Heart,
  Info,
  LogOut,
  Plus,
  Settings,
  ShoppingCart,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../services/AuthContext';
import { getDashboardStats } from '../services/dashboardService';
import { getFavoriteRecipes, getUserRecipes } from '../services/recipeService';
import { useI18n } from '../services/i18n';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
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
  const { t } = useI18n();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('chef@saveur.local');
  const [password, setPassword] = useState('saveur123');
  const [error, setError] = useState('');
  const [showAllCookbook, setShowAllCookbook] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const cookbookRef = useRef<HTMLDivElement>(null);
  const favoritesRef = useRef<HTMLDivElement>(null);

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
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] opacity-70">{t('profile.authEyebrow')}</p>
            <h1 className="text-4xl font-serif mt-2">{t('profile.authTitle')}</h1>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">{t('profile.authText')}</p>
          <div className="bg-white/10 rounded-2xl p-4 text-xs leading-relaxed">
            {t('profile.demoLogin')}:
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
              {t('profile.login')}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest ${
                authMode === 'register' ? 'bg-white text-brand-olive shadow-sm' : 'text-gray-400'
              }`}
            >
              {t('profile.register')}
            </button>
          </div>

          {authMode === 'register' && (
            <input
              type="text"
              placeholder={t('profile.fullName')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
              required
            />
          )}
          <input
            type="email"
            placeholder={t('profile.email')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
            required
          />
          <input
            type="password"
            placeholder={t('profile.password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
            minLength={6}
            required
          />

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">{error}</p>}

          <button type="submit" className="w-full btn-olive h-12">
            {authMode === 'register' ? t('profile.createAccount') : t('profile.login')}
          </button>
        </form>
      </div>
    );
  }

  const scrollToSection = (section: React.RefObject<HTMLDivElement | null>) => {
    section.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const statCards = [
    {
      label: t('stats.myRecipes'),
      value: stats.recipes,
      icon: <ChefHat size={18} />,
      action: () => scrollToSection(cookbookRef),
    },
    {
      label: t('stats.favorites'),
      value: stats.favorites,
      icon: <Heart size={18} />,
      action: () => scrollToSection(favoritesRef),
    },
    {
      label: t('stats.plannedMeals'),
      value: stats.plannedMeals,
      icon: <Calendar size={18} />,
      action: () => navigate('/plan'),
    },
    {
      label: t('stats.groceryItems'),
      value: stats.groceryItems,
      icon: <ShoppingCart size={18} />,
      action: () => navigate('/groceries'),
    },
  ];

  const accountRows = [
    { icon: <User size={20} />, label: t('profile.accountDetails'), action: undefined },
    { icon: <Bookmark size={20} />, label: t('profile.savedCollections'), action: () => navigate('/catalog') },
    { icon: <Settings size={20} />, label: t('profile.preferences'), action: undefined, control: <LanguageSwitcher /> },
    { icon: <Info size={20} />, label: t('profile.systemInformation'), action: undefined },
  ];

  const visibleCookbook = showAllCookbook ? myRecipes : myRecipes.slice(0, 4);
  const visibleFavorites = showAllFavorites ? favoriteRecipes : favoriteRecipes.slice(0, 4);

  return (
    <div className="space-y-9 pb-8">
      <header className="text-center pt-3">
        <div className="mx-auto w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-brand-olive">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            <User size={38} />
          )}
        </div>
        <div className="mt-4">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900">{user.displayName}</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.24em] mt-1">{user.email}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.button
            key={stat.label}
            type="button"
            onClick={stat.action}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3 text-left cursor-pointer hover:-translate-y-0.5 hover:border-brand-olive/25 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-olive/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-olive/10 text-brand-olive">
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-gray-900">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
          </motion.button>
        ))}
      </section>

      <section className="bg-brand-olive text-white rounded-2xl p-6 md:p-8 shadow-xl shadow-brand-olive/15 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">{t('profile.nextOnMenu')}</p>
          <h2 className="text-3xl font-serif mt-2">{t('profile.weeklySchedule')}</h2>
          <p className="text-sm text-white/70 mt-2">{t('profile.weeklyScheduleText')}</p>
        </div>
        <button
          onClick={() => navigate('/plan')}
          className="h-12 px-5 rounded-full bg-white/15 border border-white/15 text-white font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/20"
        >
          {t('profile.openPlanner')}
          <ChevronRight size={16} />
        </button>
      </section>

      <section ref={cookbookRef} className="space-y-5 scroll-mt-28">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-serif text-2xl font-medium">{t('profile.myCookbook')}</h3>
            <button
              onClick={() => navigate('/create-recipe')}
              className="w-10 h-10 rounded-xl bg-brand-olive/10 text-brand-olive flex items-center justify-center hover:bg-brand-olive hover:text-white transition-all"
              aria-label={t('home.newRecipe')}
            >
              <Plus size={20} />
            </button>
          </div>
          {myRecipes.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllCookbook((value) => !value)}
              className="text-[10px] font-bold text-brand-olive uppercase tracking-widest"
            >
              {showAllCookbook ? t('profile.showLess') : t('profile.viewAll')}
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            [1, 2, 3, 4].map((item) => <div key={item} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)
          ) : visibleCookbook.length > 0 ? (
            visibleCookbook.map((recipe) => (
              <RecipePreviewCard key={recipe.id} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.id}`)} />
            ))
          ) : (
            <div className="sm:col-span-2 xl:col-span-4 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-4">
              <ChefHat size={40} className="mx-auto text-gray-300" />
              <p className="text-gray-400 text-sm">{t('profile.emptyCookbook')}</p>
              <button onClick={() => navigate('/create-recipe')} className="text-[10px] font-bold text-brand-olive uppercase tracking-[0.2em] underline">
                {t('profile.createFirstRecipe')}
              </button>
            </div>
          )}
        </div>
      </section>

      <section ref={favoritesRef} className="space-y-5 scroll-mt-28">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-medium">{t('stats.favorites')}</h3>
          {favoriteRecipes.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllFavorites((value) => !value)}
              className="text-[10px] font-bold text-brand-olive uppercase tracking-widest"
            >
              {showAllFavorites ? t('profile.showLess') : t('profile.viewAll')}
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {visibleFavorites.length > 0 ? (
            visibleFavorites.map((recipe) => (
              <RecipePreviewCard key={recipe.id} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.id}`)} />
            ))
          ) : (
            <div className="sm:col-span-2 xl:col-span-4 bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
              {t('profile.favoriteEmpty')}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {accountRows.map((item) =>
          item.control ? (
            <div
              key={item.label}
              className="w-full flex items-center justify-between px-6 py-5 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="text-gray-400">{item.icon}</div>
                <span className="font-semibold text-gray-700 text-sm">{item.label}</span>
              </div>
              {item.control}
            </div>
          ) : !item.action ? (
            <div
              key={item.label}
              className="w-full flex items-center justify-between px-6 py-5 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="text-gray-400">{item.icon}</div>
                <span className="font-semibold text-gray-700 text-sm">{item.label}</span>
              </div>
            </div>
          ) : (
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
          )
        )}
      </section>

      <button
        type="button"
        onClick={logout}
        className="w-full h-14 rounded-full border border-red-100 bg-white/40 text-red-500 font-bold uppercase tracking-[0.24em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
      >
        <LogOut size={16} />
        {t('profile.logoutSession')}
      </button>
    </div>
  );
};

const RecipePreviewCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => {
  const { t } = useI18n();

  return (
    <button
      onClick={onClick}
      className="group bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-brand-olive/30 hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-brand-olive/30"
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
            <Clock size={10} /> {t('common.minutesShort', { count: recipe.prepTime + recipe.cookTime })}
          </span>
          {recipe.isPublic && <span className="text-brand-olive/60">{t('common.public')}</span>}
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-200 group-hover:text-brand-olive" />
    </button>
  );
};
