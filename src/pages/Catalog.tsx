import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, SlidersHorizontal, ChevronRight, X, Clock, ChefHat, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Recipe, Category } from '../types';
import { getCategories, getFilteredRecipes } from '../services/recipeService';

export const Catalog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [selectedMaxTime, setSelectedMaxTime] = useState<number | null>(null);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    getCategories().then(setCategories);
    fetchFilteredRecipes();
  }, []);

  const fetchFilteredRecipes = async (catId?: string | null, diff?: number | null, time?: number | null) => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page on filter change
    try {
      const results = await getFilteredRecipes({ 
        categoryId: catId !== undefined ? (catId || undefined) : (selectedCategory || undefined),
        difficulty: diff !== undefined ? (diff || undefined) : (selectedDifficulty || undefined),
        maxTime: time !== undefined ? (time || undefined) : (selectedMaxTime || undefined)
      });
      setRecipes(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (id: string | null) => {
    const newVal = selectedCategory === id ? null : id;
    setSelectedCategory(newVal);
    fetchFilteredRecipes(newVal, selectedDifficulty, selectedMaxTime);
  };

  const handleDifficultySelect = (val: number | null) => {
    const newVal = selectedDifficulty === val ? null : val;
    setSelectedDifficulty(newVal);
    fetchFilteredRecipes(selectedCategory, newVal, selectedMaxTime);
  };

  const handleTimeSelect = (val: number | null) => {
    const newVal = selectedMaxTime === val ? null : val;
    setSelectedMaxTime(newVal);
    fetchFilteredRecipes(selectedCategory, selectedDifficulty, newVal);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSelectedMaxTime(null);
    setShowFilters(false);
    setCurrentPage(1);
    fetchFilteredRecipes(null, null, null);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecipes = recipes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(recipes.length / itemsPerPage);

  const displayedCategories = showAllCollections ? categories : categories.slice(0, 3);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-serif">Explore Catalogue</h1>
        <p className="text-gray-500 text-sm mt-1">Discover over 500 delicious recipes</p>
      </header>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search recipes, ingredients..."
          className="w-full bg-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-olive outline-hidden transition-all text-sm font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button 
          onClick={() => setShowFilters(true)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl shadow-sm transition-colors ${showFilters || selectedCategory || selectedDifficulty ? 'bg-brand-olive text-white' : 'text-brand-olive bg-white'}`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Results Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-serif text-xl">
            {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Recipes'}
            {selectedDifficulty ? ` • Level ${selectedDifficulty}` : ''}
          </h3>
          {(selectedCategory || selectedDifficulty) && (
            <button onClick={clearFilters} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clear</button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-100 rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              {currentRecipes.map((recipe) => (
                <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="group">
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <div className="aspect-square card-rounded bg-gray-100 overflow-hidden relative">
                      <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={recipe.title} />
                    </div>
                    <h4 className="font-serif text-lg leading-tight truncate">{recipe.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <Clock size={10} /> {recipe.prepTime + recipe.cookTime}m
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <ChefHat size={10} /> Lvl {recipe.difficulty}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <SearchIcon size={32} />
            </div>
            <p className="text-gray-400 text-sm">No recipes found matching these filters.</p>
          </div>
        )}
      </section>

      {/* Top Collections (Categories) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-serif text-xl">Top Collections</h3>
          {categories.length > 3 && (
            <button 
              onClick={() => setShowAllCollections(!showAllCollections)}
              className="text-[10px] font-bold text-brand-olive uppercase tracking-widest"
            >
              {showAllCollections ? 'Show Less' : 'View All'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {displayedCategories.map((cat) => (
            <motion.div 
              key={cat.id}
              whileHover={{ scale: 0.98 }}
              onClick={() => handleCategorySelect(cat.id)}
              className={`relative h-28 rounded-3xl overflow-hidden group cursor-pointer border-2 transition-all ${selectedCategory === cat.id ? 'border-brand-olive' : 'border-transparent'}`}
            >
              <img src={cat.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&fit=crop'} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.name} />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-between px-8 text-white">
                <div>
                  <h4 className="text-xl font-serif font-medium">{cat.name}</h4>
                  <span className="text-[10px] uppercase tracking-widest opacity-80">Explore Collection</span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedCategory === cat.id ? 'bg-brand-olive' : 'bg-white/20 backdrop-blur'}`}>
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Difficulty Filters */}
      <section className="space-y-4">
        <h3 className="font-serif text-xl px-2">Difficulty Level</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { label: 'Beginner', val: 1 },
            { label: 'Intermediate', val: 3 },
            { label: 'Expert', val: 5 }
          ].map((level) => (
            <button 
              key={level.label}
              onClick={() => handleDifficultySelect(level.val)}
              className={`px-6 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${selectedDifficulty === level.val ? 'bg-brand-olive border-brand-olive text-white shadow-lg shadow-brand-olive/20' : 'bg-white border-gray-100 text-gray-500'}`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </section>

      {/* Time Filters */}
      <section className="space-y-4 pb-10">
        <h3 className="font-serif text-xl px-2">Max Cooking Time</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[15, 30, 45, 60].map((time) => (
            <button 
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`px-6 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${selectedMaxTime === time ? 'bg-brand-olive border-brand-olive text-white shadow-lg shadow-brand-olive/20' : 'bg-white border-gray-100 text-gray-500'}`}
            >
              Under {time} min
            </button>
          ))}
        </div>
      </section>

      {/* Filter Sidebar Placeholder (Sheet) */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-4/5 bg-white z-50 shadow-2xl p-8 space-y-10"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif">Filters</h2>
                <button onClick={() => setShowFilters(false)}><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">By Collection</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => handleCategorySelect(selectedCategory === cat.id ? null : cat.id)}
                        className={`px-3 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-tighter transition-all border text-center ${selectedCategory === cat.id ? 'bg-brand-olive border-brand-olive text-white' : 'border-gray-100 text-gray-600'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">By Difficulty</h4>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button 
                        key={v}
                        onClick={() => handleDifficultySelect(v)}
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold transition-all ${selectedDifficulty === v ? 'bg-brand-olive border-brand-olive text-white' : 'border-gray-100 text-gray-400'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Max Time</h4>
                  <div className="flex flex-wrap gap-2">
                    {[15, 30, 60, 120].map(t => (
                      <button 
                        key={t}
                        onClick={() => handleTimeSelect(t)}
                        className={`px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${selectedMaxTime === t ? 'bg-brand-olive border-brand-olive text-white' : 'border-gray-100 text-gray-400'}`}
                      >
                        {t}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-8 right-8 space-y-3">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full btn-olive py-4 shadow-xl shadow-brand-olive/20"
                >
                  Apply Filters
                </button>
                <button 
                  onClick={clearFilters}
                  className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest py-2"
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
