import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Clock, Users, ChefHat, Heart, Star, Share2 } from 'lucide-react';
import { getRecipeById } from '../services/recipeService';
import { Recipe } from '../types';

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');

  useEffect(() => {
    if (id) {
      getRecipeById(id).then(setRecipe);
    }
  }, [id]);

  if (!recipe) {
    // Placeholder while loading
    return (
      <div className="animate-pulse space-y-6 -mx-4 -mt-6">
        <div className="h-96 bg-gray-200" />
        <div className="px-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6 pb-12">
      {/* Hero Section */}
      <div className="relative h-[480px]">
        <img 
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&fit=crop'} 
          className="w-full h-full object-cover"
          alt={recipe.title}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />
        
        {/* Top Controls */}
        <div className="absolute top-12 left-6 right-6 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Share2 size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Heart size={20} />
            </button>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-10 left-6 right-6 text-white space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-brand-olive rounded-full text-[10px] font-bold uppercase tracking-widest">Dinner</span>
            <div className="flex items-center gap-1 text-brand-gold">
              <Star size={14} fill="currentColor" />
              <span className="text-xs font-bold">4.9 (124 reviews)</span>
            </div>
          </div>
          <h1 className="text-4xl font-serif leading-tight">{recipe.title}</h1>
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Clock size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs opacity-70 uppercase tracking-tighter">Time</span>
                <span className="text-xs font-bold">{recipe.prepTime + recipe.cookTime} min</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <ChefHat size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs opacity-70 uppercase tracking-tighter">Level</span>
                <span className="text-xs font-bold">{recipe.difficulty}/5</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Users size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs opacity-70 uppercase tracking-tighter">Yield</span>
                <span className="text-xs font-bold">{recipe.servings} Servings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white -mt-8 rounded-t-[40px] px-6 pt-10 relative z-10 space-y-8 min-h-screen">
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button 
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'ingredients' ? 'bg-white shadow-sm text-brand-olive' : 'text-gray-400'}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button 
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === 'steps' ? 'bg-white shadow-sm text-brand-olive' : 'text-gray-400'}`}
            onClick={() => setActiveTab('steps')}
          >
            Steps
          </button>
        </div>

        {activeTab === 'ingredients' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-serif text-xl">What you'll need</h3>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{recipe.servings} servings</span>
            </div>
            {[
              { name: 'Gorgonzola Cheese', amount: '150g' },
              { name: 'Walnuts', amount: '50g', note: 'Toasted' },
              { name: 'Heavy Cream', amount: '100ml' },
              { name: 'Fresh Tagliatelle', amount: '250g' },
              { name: 'Sage Leaves', amount: '5-6', note: 'Fresh' },
            ].map((ing, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">{ing.name}</span>
                  {ing.note && <span className="text-[10px] text-gray-400 uppercase tracking-widest">{ing.note}</span>}
                </div>
                <span className="text-brand-olive font-bold text-sm bg-brand-olive/10 px-3 py-1 rounded-lg">{ing.amount}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {[
              { title: 'Prepare the walnuts', text: 'Finely chop the walnuts and toast them in a dry pan until fragrant, about 3-4 minutes. Set aside.' },
              { title: 'Create the cream base', text: 'In a large saucepan, melt the gorgonzola into the heavy cream over low heat until smooth and silky.' },
              { title: 'Cook the pasta', text: 'Bring a large pot of salted water to boil. Cook the fresh pasta for 3-4 minutes until al dente.' },
              { title: 'Combine & Serve', text: 'Toss the pasta with the sauce, adding a splash of pasta water if needed. Serve with walnuts and fresh sage.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 relative">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-2xl bg-brand-olive text-white flex items-center justify-center font-serif text-lg shrink-0">
                    {i + 1}
                  </div>
                  {i < 3 && <div className="flex-1 w-px bg-brand-olive/20 my-2" />}
                </div>
                <div className="pb-4">
                  <h4 className="font-serif text-lg leading-none mb-2">{step.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="w-full btn-olive py-4 shadow-xl shadow-brand-olive/20 flex items-center justify-center gap-3">
          <Clock size={20} />
          Start Cooking Mode
        </button>
      </div>
    </div>
  );
};
