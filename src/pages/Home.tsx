import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChefHat,
  Clock,
  Plus,
  Star,
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useI18n } from '../services/i18n';
import { getCategories, getFeaturedRecipes } from '../services/recipeService';
import { Category, Recipe } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';

const temporaryFeaturedRecipeRating = 4.8;

function getRecipeRating(recipe?: Recipe) {
  const ratingSource = recipe as (Recipe & { rating?: number; averageRating?: number }) | undefined;
  const rating = ratingSource?.rating ?? ratingSource?.averageRating;
  return typeof rating === 'number' && Number.isFinite(rating) ? rating : temporaryFeaturedRecipeRating;
}

function difficultyKey(difficulty?: number): 'difficulty.easy' | 'difficulty.intermediate' | 'difficulty.difficult' {
  if ((difficulty || 1) <= 1) return 'difficulty.easy';
  if ((difficulty || 1) === 2) return 'difficulty.intermediate';
  return 'difficulty.difficult';
}

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { t, categoryLabel } = useI18n();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeResults, categoryResults] = await Promise.all([
          getFeaturedRecipes(12),
          getCategories(),
        ]);
        setRecipes(recipeResults);
        setCategories(categoryResults);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featured = recipes[0];
  const firstName = user?.displayName?.split(' ')[0] || 'Chef';

  return (
    <div className="space-y-8">
      <header className="grid lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 italic leading-tight">
            {user ? t('home.titleUser', { name: firstName }) : t('home.titleGuest')}
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base leading-relaxed">{t('home.subtitle')}</p>
        </div>

        {user && (
          <div className="flex items-center lg:justify-end">
            <button onClick={() => navigate('/create-recipe')} className="btn-olive h-12 px-5 flex items-center gap-2">
              <Plus size={18} />
              {t('home.newRecipe')}
            </button>
          </div>
        )}
      </header>

      {!user && (
        <section className="rounded-2xl border border-brand-olive/10 bg-white p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-olive/10 text-brand-olive flex items-center justify-center">
              <ChefHat size={20} />
            </div>
            <p className="text-sm text-gray-600">{t('home.signInPrompt')}</p>
          </div>
          <Link to="/profile" className="btn-olive h-11 px-5 inline-flex items-center justify-center text-sm">
            {t('nav.signIn')}
          </Link>
        </section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[360px] card-rounded bg-gray-200 group overflow-hidden"
      >
        {loading ? (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        ) : (
          <Link to={featured ? `/recipe/${featured.id}` : '/catalog'} className="block absolute inset-0">
            <img
              src={featured?.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&fit=crop'}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={featured?.title || t('home.recipeOfDay')}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-6 right-6 md:left-8 md:right-8 text-white max-w-2xl">
              <span className="bg-brand-gold text-black text-[10px] font-bold uppercase py-1 px-3 rounded-full mb-4 inline-block">
                {t('home.recipeOfDay')}
              </span>
              <h2 className="text-4xl font-serif leading-tight">{featured?.title || t('home.recipeOfDay')}</h2>
              <p className="text-sm text-gray-200 mt-2">{featured?.description || t('home.subtitle')}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-200">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {t('common.minutesShort', { count: featured ? featured.prepTime + featured.cookTime : 25 })}
                </span>
                <span className="text-white/50">·</span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-brand-gold fill-brand-gold" /> {getRecipeRating(featured).toFixed(1)}
                </span>
                <span className="text-white/50">·</span>
                <span>{t(difficultyKey(featured?.difficulty))}</span>
              </div>
            </div>
          </Link>
        )}
      </motion.section>

      <section>
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="text-xl font-serif">{t('home.categories')}</h3>
          <Link to="/catalog" className="text-[10px] font-bold text-brand-olive uppercase tracking-widest">
            {t('home.viewCatalog')}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate('/catalog', { state: { categoryId: cat.id } })}
              className="h-32 rounded-2xl relative overflow-hidden group text-left"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop'}
                alt={categoryLabel(cat)}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors" />
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  {getCategoryIcon(cat.name)}
                </div>
                <span className="font-serif text-lg leading-tight">{categoryLabel(cat)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-serif">{t('home.recommended')}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? [1, 2, 3, 4].map((item) => <div key={item} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />)
            : recipes.slice(0, 8).map((recipe) => (
                <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="group">
                  <motion.div whileHover={{ y: -5 }} className="space-y-2">
                    <div className="aspect-square card-rounded bg-gray-100 overflow-hidden relative">
                      <img
                        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=500&fit=crop'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        alt={recipe.title}
                      />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg leading-tight group-hover:text-brand-olive transition-colors">
                        {recipe.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                        <span>{t('common.minutesShort', { count: recipe.prepTime + recipe.cookTime })}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <Star size={11} className="text-brand-gold fill-brand-gold" /> {getRecipeRating(recipe).toFixed(1)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{t(difficultyKey(recipe.difficulty))}</span>
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
