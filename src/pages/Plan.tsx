import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Plus, ChefHat, Clock, X, Search } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { getMealPlanForDate, addToMealPlan } from '../services/mealPlanService';
import { getFeaturedRecipes, getUserRecipes } from '../services/recipeService';
import { Recipe } from '../types';

export const Plan: React.FC = () => {
  const { user } = useAuth();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [selectedDay, setSelectedDay] = useState(0);
  const [mealPlan, setMealPlan] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Recipe Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectingMealType, setSelectingMealType] = useState<string | null>(null);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');

  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday

  const getDayDate = (index: number) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + index);
    return date.toISOString().split('T')[0];
  };

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const dateStr = getDayDate(selectedDay);
      let entries = [];
      
      if (user) {
        entries = await getMealPlanForDate(user.uid, dateStr);
      } else {
        // Guest mode: load from localStorage
        const localData = localStorage.getItem(`mealPlan_${dateStr}`);
        entries = localData ? JSON.parse(localData) : [];
      }
      
      const mealMap: any = {
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null
      };
      
      entries.forEach((entry: any) => {
        mealMap[entry.mealType] = {
          id: entry.id,
          recipeId: entry.recipeId,
          title: entry.recipe?.title || entry.title || 'Unknown Recipe',
          time: entry.time || `${(entry.recipe?.prepTime || 0) + (entry.recipe?.cookTime || 0)} min`,
          img: entry.recipe?.imageUrl || entry.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&fit=crop'
        };
      });
      
      setMealPlan(mealMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlan();
  }, [selectedDay, user]);

  const openPicker = async (mealType: string) => {
    setSelectingMealType(mealType);
    setIsPickerOpen(true);
    
    // Fetch recipes for the picker
    const [featured, userRecs] = await Promise.all([
      getFeaturedRecipes(30),
      user ? getUserRecipes(user.uid) : Promise.resolve([])
    ]);
    
    // Combine and deduplicate
    const combined = [...userRecs];
    featured.forEach(f => {
      if (!combined.find(c => c.id === f.id)) {
        combined.push(f);
      }
    });
    
    setAvailableRecipes(combined);
  };

  const handlePickRecipe = async (recipeId: string) => {
    if (!selectingMealType) return;
    
    const dateStr = getDayDate(selectedDay);
    const selectedRecipe = availableRecipes.find(r => r.id === recipeId);

    if (user) {
      await addToMealPlan(user.uid, dateStr, recipeId, selectingMealType);
    } else {
      // Guest mode: Save to local storage
      const localData = localStorage.getItem(`mealPlan_${dateStr}`);
      const entries = localData ? JSON.parse(localData) : [];
      
      const newEntry = {
        id: `local_${Date.now()}`,
        date: dateStr,
        recipeId: recipeId,
        mealType: selectingMealType,
        title: selectedRecipe?.title,
        time: `${(selectedRecipe?.prepTime || 0) + (selectedRecipe?.cookTime || 0)} min`,
        img: selectedRecipe?.imageUrl
      };

      // Replace existing of same type
      const filtered = entries.filter((e: any) => e.mealType !== selectingMealType);
      localStorage.setItem(`mealPlan_${dateStr}`, JSON.stringify([...filtered, newEntry]));
    }
    
    setIsPickerOpen(false);
    fetchMealPlan();
  };

  const filteredRecipes = availableRecipes.filter(r => 
    r.title.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif">Meal Planner</h1>
          <p className="text-gray-500 text-sm mt-1">Week of {getDayDate(0)} - {getDayDate(6)}</p>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 italic font-serif text-brand-olive text-sm">
          {new Date(getDayDate(selectedDay)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </header>

      {/* Date Picker */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {days.map((day, i) => {
          const dateNode = new Date(getDayDate(i));
          const dayNum = dateNode.getDate();
          return (
            <button 
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center gap-2 min-w-[64px] py-4 rounded-3xl transition-all ${selectedDay === i ? 'bg-brand-olive text-white shadow-lg shadow-brand-olive/20' : 'bg-white text-gray-500 border border-gray-100'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{day}</span>
              <span className={`text-xl font-serif ${selectedDay === i ? 'text-white' : 'text-gray-900'}`}>{dayNum}</span>
              {selectedDay === i && <div className="w-1 h-1 rounded-full bg-white animate-bounce" />}
            </button>
          );
        })}
      </div>

      {/* Meal Selection */}
      <div className="space-y-6">
        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
          const meal = mealPlan[type];
          return (
            <div key={type} className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{type}</h3>
                {!meal && <span className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase">Empty Slot</span>}
              </div>
              
              {loading ? (
                <div className="h-24 bg-gray-50 rounded-[28px] animate-pulse" />
              ) : meal ? (
                <motion.div 
                  whileHover={{ x: 5 }}
                  onClick={() => openPicker(type)}
                  className="bg-white p-3 rounded-[28px] border border-gray-100 shadow-xs flex items-center gap-4 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                    <img src={meal.img} className="w-full h-full object-cover" alt={meal.title} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-lg leading-tight group-hover:text-brand-olive transition-colors">{meal.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      <Clock size={12} />
                      <span>{meal.time}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-olive opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                    <Plus size={20} className="rotate-45" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:hidden transition-all">
                    <ChevronRight size={20} />
                  </div>
                </motion.div>
              ) : (
                <button 
                  onClick={() => openPicker(type)}
                  className="w-full border-2 border-dashed border-gray-100 bg-white p-6 rounded-[28px] flex flex-col items-center justify-center gap-2 text-gray-400 group hover:border-brand-olive/30 hover:text-brand-olive transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-olive/10 group-hover:text-brand-olive transition-colors">
                    <Plus size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Pick a recipe</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-brand-olive rounded-[32px] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <h3 className="text-xl font-serif mb-2 relative z-10 text-brand-cream">Nutritional Insight</h3>
        <p className="text-sm opacity-80 leading-relaxed relative z-10">
          Your current plan for {days[selectedDay]} is {Object.values(mealPlan).filter(m => m !== null).length >= 3 ? 'well-balanced' : 'incomplete'}. 
          {Object.values(mealPlan).filter(m => m !== null).length >= 3 ? " You're meeting your primary nutritional goals." : " Try adding more meals to see insights."}
        </p>
        <div className="mt-4 flex gap-4 relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase opacity-60">Estimated Calories</span>
            <span className="text-sm font-bold">{Object.values(mealPlan).filter(m => m !== null).length * 520} kcal</span>
          </div>
        </div>
      </div>

      {/* Recipe Picker Modal */}
      <AnimatePresence>
        {isPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPickerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-cream/30">
                <div>
                  <h3 className="text-xl font-serif capitalize">Pick {selectingMealType}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Select a recipe for your plan</p>
                </div>
                <button 
                  onClick={() => setIsPickerOpen(false)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 bg-white border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search recipes..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-olive/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredRecipes.length > 0 ? (
                  filteredRecipes.map((recipe) => (
                    <motion.div 
                      key={recipe.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePickRecipe(recipe.id)}
                      className="p-3 rounded-3xl border border-gray-100 flex items-center gap-3 cursor-pointer hover:border-brand-olive/30 hover:bg-brand-olive/5 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                        <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&fit=crop'} className="w-full h-full object-cover" alt={recipe.title} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-base leading-tight truncate group-hover:text-brand-olive transition-colors">{recipe.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          <Clock size={10} />
                          <span>{recipe.prepTime + recipe.cookTime} min</span>
                        </div>
                      </div>
                      <div className="text-brand-olive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={20} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <ChefHat size={32} />
                    </div>
                    <p className="text-gray-400 text-sm italic px-10">No recipes found. Try a different search or create a new recipe!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
