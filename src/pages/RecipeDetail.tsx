import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChefHat, ChevronLeft, Clock, Heart, Users } from 'lucide-react';
import { getRecipeById, toggleFavorite } from '../services/recipeService';
import { useAuth } from '../services/AuthContext';
import { Recipe } from '../types';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getRecipeById(id)
      .then(setRecipe)
      .finally(() => setLoading(false));
  }, [id]);

  const handleFavorite = async () => {
    if (!recipe) return;
    if (!user) {
      navigate('/profile');
      return;
    }

    const isFavorite = await toggleFavorite(user.uid, recipe.id);
    setRecipe({ ...recipe, isFavorite });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-96 bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <ChefHat size={42} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-serif">Recipe not found</h1>
        <p className="text-sm text-gray-500 mt-2">It may have been deleted or made private.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <section className="relative min-h-[420px] rounded-2xl overflow-hidden bg-gray-200">
        <img
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1000&fit=crop'}
          className="absolute inset-0 w-full h-full object-cover"
          alt={recipe.title}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/40" />

        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleFavorite}
            className={`w-12 h-12 rounded-xl backdrop-blur-md flex items-center justify-center hover:bg-white/30 ${
              recipe.isFavorite ? 'bg-brand-gold text-black' : 'bg-white/20 text-white'
            }`}
            aria-label="Toggle favorite"
          >
            <Heart size={20} fill={recipe.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="absolute bottom-8 left-6 right-6 md:left-8 md:right-8 text-white max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-olive rounded-full text-[10px] font-bold uppercase tracking-widest">
              {recipe.categoryName || 'Recipe'}
            </span>
            <span className="text-xs font-bold opacity-80">By {recipe.userName || 'Saveur user'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif leading-tight">{recipe.title}</h1>
          <p className="text-sm text-gray-200 max-w-2xl">{recipe.description}</p>
          <div className="flex flex-wrap items-center gap-5 pt-2">
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="text-sm font-bold">{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat size={18} />
              <span className="text-sm font-bold">Level {recipe.difficulty}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span className="text-sm font-bold">{recipe.servings} servings</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm space-y-6">
        <div className="flex p-1 bg-gray-100 rounded-xl max-w-md">
          <button
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
              activeTab === 'ingredients' ? 'bg-white shadow-sm text-brand-olive' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
              activeTab === 'steps' ? 'bg-white shadow-sm text-brand-olive' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('steps')}
          >
            Steps
          </button>
        </div>

        {activeTab === 'ingredients' ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl">What you need</h3>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{recipe.servings} servings</span>
            </div>
            {(recipe.ingredients || []).map((ingredient) => (
              <div key={ingredient.id || ingredient.name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">{ingredient.name}</span>
                  {ingredient.optional && <span className="text-[10px] text-gray-400 uppercase tracking-widest">Optional</span>}
                </div>
                <span className="text-brand-olive font-bold text-sm bg-brand-olive/10 px-3 py-1 rounded-lg">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {(recipe.steps || []).map((step, index) => (
              <div key={step.id || step.order} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-brand-olive text-white flex items-center justify-center font-serif text-lg shrink-0">
                    {index + 1}
                  </div>
                  {index < (recipe.steps?.length || 0) - 1 && <div className="flex-1 w-px bg-brand-olive/20 my-2" />}
                </div>
                <div className="pb-4">
                  <h4 className="font-serif text-lg leading-none mb-2">{step.title || `Step ${index + 1}`}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
