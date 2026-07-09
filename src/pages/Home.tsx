import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Apple,
  Calendar,
  ChefHat,
  Clock,
  Coffee,
  Dessert,
  Heart,
  Pizza,
  Plus,
  Salad,
  ShoppingBag,
  Star,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { getCategories, getFeaturedRecipes } from '../services/recipeService';
import { getDashboardStats } from '../services/dashboardService';
import { Category, DashboardStats, Recipe } from '../types';

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('petit') || n.includes('breakfast')) return <Coffee size={24} />;
  if (n.includes('plat') || n.includes('main') || n.includes('dinner')) return <UtensilsCrossed size={24} />;
  if (n.includes('dessert') || n.includes('sweet')) return <Dessert size={24} />;
  if (n.includes('salad') || n.includes('salade')) return <Salad size={24} />;
  if (n.includes('snack') || n.includes('gouter')) return <Apple size={24} />;
  if (n.includes('pizza') || n.includes('fast')) return <Pizza size={24} />;
  return <Zap size={24} />;
};

const emptyStats: DashboardStats = {
  recipes: 0,
  favorites: 0,
  plannedMeals: 0,
  groceryItems: 0,
};

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeResults, categoryResults, dashboardStats] = await Promise.all([
          getFeaturedRecipes(8),
          getCategories(),
          user ? getDashboardStats() : Promise.resolve(emptyStats),
        ]);
        setRecipes(recipeResults);
        setCategories(categoryResults);
        setStats(dashboardStats);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const featured = recipes[0];
  const initials = user?.displayName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statCards = [
    { label: 'My Recipes', value: stats.recipes, icon: ChefHat },
    { label: 'Favorites', value: stats.favorites, icon: Heart },
    { label: 'Planned Meals', value: stats.plannedMeals, icon: Calendar },
    { label: 'Grocery Items', value: stats.groceryItems, icon: ShoppingBag },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-xs text-brand-olive font-bold uppercase tracking-[0.24em] mb-2">Tableau de bord</p>
          <h1 className="text-4xl font-serif text-gray-900 italic">
            Bonjour, {user?.displayName?.split(' ')[0] || 'Chef'}
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-2">
            Manage recipes, weekly meals, favorites and shopping lists from one web app.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/create-recipe')} className="btn-olive h-12 px-5 flex items-center gap-2">
            <Plus size={18} />
            New recipe
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-brand-olive font-bold">
            {initials || <ChefHat size={20} />}
          </div>
        </div>
      </header>

      {user && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-olive/10 text-brand-olive flex items-center justify-center mb-4">
                  <Icon size={18} />
                </div>
                <p className="text-3xl font-serif font-bold leading-none">{stat.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            );
          })}
        </section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[340px] card-rounded bg-gray-200 group overflow-hidden"
      >
        {loading ? (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        ) : (
          <Link to={featured ? `/recipe/${featured.id}` : '/catalog'} className="block absolute inset-0">
            <img
              src={featured?.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&fit=crop'}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={featured?.title || 'Featured recipe'}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-6 right-6 md:left-8 md:right-8 text-white max-w-2xl">
              <span className="bg-brand-gold text-black text-[10px] font-bold uppercase py-1 px-3 rounded-full mb-4 inline-block">
                Recipe of the day
              </span>
              <h2 className="text-4xl font-serif leading-tight">{featured?.title || 'Explore the recipe catalog'}</h2>
              <p className="text-sm text-gray-200 mt-2">{featured?.description || 'Browse public recipes and add them to your meal plan.'}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-200">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {featured ? featured.prepTime + featured.cookTime : 25} min
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-brand-gold fill-brand-gold" /> Level {featured?.difficulty || 2}
                </span>
              </div>
            </div>
          </Link>
        )}
      </motion.section>

      <section>
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="text-xl font-serif">Categories</h3>
          <Link to="/catalog" className="text-[10px] font-bold text-brand-olive uppercase tracking-widest">
            View catalog
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate('/catalog', { state: { categoryId: cat.id } })}
              className="h-28 rounded-2xl relative overflow-hidden group text-left"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors" />
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="font-serif text-lg leading-tight">{cat.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-serif">Recommended recipes</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(recipes.length > 0 ? recipes.slice(0, 8) : Array(4).fill(null)).map((recipe, i) => (
            <Link key={recipe?.id || i} to={recipe ? `/recipe/${recipe.id}` : '/catalog'} className="group">
              <motion.div whileHover={{ y: -5 }} className="space-y-2">
                <div className="aspect-square card-rounded bg-gray-100 overflow-hidden relative">
                  <img
                    src={recipe?.imageUrl || `https://images.unsplash.com/photo-1493770348161-369560ae357d?w=500&fit=crop&q=${i}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    alt={recipe?.title || 'Recipe'}
                  />
                </div>
                <div>
                  <h4 className="font-serif text-lg leading-tight group-hover:text-brand-olive transition-colors">
                    {recipe?.title || 'Recipe example'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                    <span>{recipe ? recipe.prepTime + recipe.cookTime : 20} min</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-0.5">
                      Level {recipe?.difficulty || 3}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
