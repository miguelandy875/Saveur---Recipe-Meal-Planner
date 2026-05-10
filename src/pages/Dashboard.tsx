import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutGrid, 
  ChefHat, 
  Heart, 
  TrendingUp, 
  Clock, 
  Calendar, 
  ShoppingCart,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { getUserRecipes, getFeaturedRecipes } from '../services/recipeService';
import { Recipe } from '../types';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [statTotals, setStatTotals] = useState({ cooked: 12, flavors: 4, hours: 8 });

  useEffect(() => {
    if (user) {
      getUserRecipes(user.uid).then(setMyRecipes);
    }
  }, [user]);

  const stats = [
    { label: 'Recipes', value: myRecipes.length, icon: <ChefHat size={18} />, color: 'bg-orange-100 text-orange-600' },
    { label: 'Favorites', value: 8, icon: <Heart size={18} />, color: 'bg-red-100 text-red-600' },
    { label: 'Plan', value: 3, icon: <Calendar size={18} />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Grocery', value: 15, icon: <ShoppingCart size={18} />, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif">Tableau de Bord</h1>
          <p className="text-sm text-gray-500">Bienvenue, {user?.displayName || 'Chef'}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-olive/10 flex items-center justify-center text-brand-olive font-serif text-xl border border-brand-olive/20 shadow-xs">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="p-5 bg-white rounded-[32px] border border-gray-100 shadow-xs space-y-3"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-serif font-bold">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Weekly Plan Card */}
      <section className="bg-brand-olive text-white p-8 rounded-[40px] relative overflow-hidden shadow-xl shadow-brand-olive/20">
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif">Planning Hebdomadaire</h3>
            <p className="text-xs opacity-70">Vous avez 4 repas prévus cette semaine</p>
          </div>
          <button className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border border-white/20">
            Voir le calendrier
          </button>
        </div>
        <TrendingUp size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
      </section>

      {/* Recent Recipes */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-serif text-xl font-medium">Mes Recettes Récentes</h3>
          <button onClick={() => navigate('/catalog')} className="text-[10px] font-bold text-brand-olive uppercase tracking-widest flex items-center gap-1">
            Voir tout <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="space-y-3">
          {myRecipes.slice(0, 3).map((recipe) => (
            <motion.div 
              key={recipe.id}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
              className="group bg-white p-4 rounded-3xl border border-gray-50 flex items-center gap-4 hover:border-brand-olive/30 transition-all cursor-pointer shadow-xs"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                <img src={recipe.imageUrl} className="w-full h-full object-cover" alt={recipe.title} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-lg leading-tight truncate">{recipe.title}</h4>
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  <span className="flex items-center gap-1"><Clock size={10} /> {recipe.prepTime}m</span>
                  <span className="flex items-center gap-1 text-brand-gold"><Heart size={10} fill="currentColor" /> Favori</span>
                </div>
              </div>
              <ChevronRight className="text-gray-200 group-hover:text-brand-olive transition-colors" size={20} />
            </motion.div>
          ))}

          {myRecipes.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-[32px] space-y-4">
              <ChefHat size={40} className="mx-auto text-gray-200" />
              <p className="text-gray-400 text-sm">Vous n'avez pas encore de recettes.</p>
              <button 
                onClick={() => navigate('/create-recipe')}
                className="btn-olive py-3 px-8 text-xs inline-flex items-center gap-2"
              >
                <Plus size={16} /> Créer ma première recette
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
