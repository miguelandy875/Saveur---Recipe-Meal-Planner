import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronRight, Clock, ChefHat, Plus, Coffee, UtensilsCrossed, Dessert, Apple, Salad, Pizza, Zap } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { getFeaturedRecipes, getCategories } from '../services/recipeService';
import { seedDatabase } from '../services/seedService';
import { Recipe, Category } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('petit') || n.includes('breakfast')) return <Coffee size={24} />;
  if (n.includes('plat') || n.includes('main') || n.includes('dinner')) return <UtensilsCrossed size={24} />;
  if (n.includes('dessert') || n.includes('sweet')) return <Dessert size={24} />;
  if (n.includes('entrée') || n.includes('starter') || n.includes('salad')) return <Salad size={24} />;
  if (n.includes('snack') || n.includes('goûter')) return <Apple size={24} />;
  if (n.includes('pizza') || n.includes('fast')) return <Pizza size={24} />;
  return <Zap size={24} />; // Default icon
};

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.email === 'miguelandy875@gmail.com') {
          await seedDatabase();
        }
        const [r, c] = await Promise.all([getFeaturedRecipes(4), getCategories()]);
        setRecipes(r);
        
        // Deduplicate categories by name
        const uniqueCats: Category[] = [];
        const names = new Set();
        c.forEach(cat => {
          if (!names.has(cat.name)) {
            names.add(cat.name);
            uniqueCats.push(cat);
          }
        });
        setCategories(uniqueCats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 italic">
            Bonjour, {user?.displayName?.split(' ')[0] || 'Gourmet'}
          </h1>
          <p className="text-gray-500 font-medium text-sm uppercase tracking-widest mt-1">
            What's on the menu today?
          </p>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-olive p-0.5">
          <img 
            src={user?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </header>

      {/* Featured Recipe Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative aspect-[16/10] card-rounded bg-gray-200 group cursor-pointer"
      >
        <img 
          src={recipes[0]?.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&fit=crop'} 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Featured"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <span className="bg-brand-gold text-black text-[10px] font-bold uppercase py-1 px-3 rounded-full mb-3 inline-block">
            Recipe of the Day
          </span>
          <h2 className="text-2xl font-serif leading-tight">{recipes[0]?.title || 'Gorgonzola & Walnut Pasta'}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
            <span className="flex items-center gap-1"><Clock size={14} /> 25m</span>
            <span className="flex items-center gap-1"><Star size={14} className="text-brand-gold fill-brand-gold" /> 4.9</span>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="text-xl font-serif">Categories</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {categories.slice(0, 10).map((cat) => (
            <motion.div 
              key={cat.id} 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/catalog', { state: { categoryId: cat.id } })}
              className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl relative overflow-hidden group shadow-sm border border-gray-100">
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                    {getCategoryIcon(cat.name)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{cat.name}</span>
            </motion.div>
          ))}

          {categories.length === 0 && Array(5).fill(null).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center animate-pulse" />
              <div className="w-10 h-2 bg-gray-50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-serif">Recommended for you</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(recipes.length > 0 ? recipes : Array(4).fill(null)).map((recipe, i) => (
            <Link key={recipe?.id || i} to={recipe ? `/recipe/${recipe.id}` : '#'} className="group">
              <motion.div 
                whileHover={{ y: -5 }}
                className="space-y-2"
              >
                <div className="aspect-square card-rounded bg-gray-100 overflow-hidden relative">
                  <img 
                    src={recipe?.imageUrl || `https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&fit=crop&q=${i}`} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    alt={recipe?.title || 'Recipe'}
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                    <Star size={16} className="text-gray-400" />
                  </button>
                </div>
                <div>
                  <h4 className="font-serif text-lg leading-tight group-hover:text-brand-olive transition-colors">
                    {recipe?.title || 'Autumn Squash Soup'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                    <span>{recipe?.prepTime || 20} min</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-0.5">
                      {recipe?.difficulty || 3} <ChefHat size={10} />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAB for Create Recipe */}
      {user && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/create-recipe')}
          className="fixed bottom-24 right-8 w-14 h-14 bg-brand-olive text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 border-4 border-white"
        >
          <Plus size={28} />
        </motion.button>
      )}
    </div>
  );
};
