import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronRight, Clock, ChefHat, Plus } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { getFeaturedRecipes, getCategories } from '../services/recipeService';
import { seedDatabase } from '../services/seedService';
import { Recipe, Category } from '../types';
import { Link, useNavigate } from 'react-router-dom';

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
        setCategories(c);
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
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-serif">Categories</h3>
          <button className="text-brand-olive text-sm font-semibold flex items-center gap-1">
            View all <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.length > 0 ? categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-brand-olive/10 flex items-center justify-center overflow-hidden">
                <img src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-tighter">{cat.name}</span>
            </div>
          )) : (
            ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegan'].map((name) => (
              <div key={name} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-brand-olive/10 flex items-center justify-center p-4">
                  <ChefHat className="text-brand-olive" />
                </div>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-tighter">{name}</span>
              </div>
            ))
          )}
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
