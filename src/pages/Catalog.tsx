import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  ChevronRight, 
  X, 
  Clock, 
  ChefHat, 
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Recipe, Category } from '../types';
import { getCategories, getFilteredRecipes } from '../services/recipeService';
import { useI18n } from '../services/i18n';
import { getCategoryIcon } from '../utils/categoryIcons';

export const Catalog: React.FC = () => {
  const location = useLocation();
  const { t, categoryLabel } = useI18n();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categoryRecipes, setCategoryRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [selectedMaxTime, setSelectedMaxTime] = useState<number | null>(null);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const COLLECTION_LIMIT = 3;

  useEffect(() => {
    const state = location.state as { categoryId?: string } | null;
    if (state?.categoryId) {
      setSelectedCategory(state.categoryId);
      fetchCategoryRecipes(state.categoryId);
    }
  }, [location.state]);

  useEffect(() => {
    getCategories().then(cats => {
      // Deduplicate by name
      const uniqueCats: Category[] = [];
      const names = new Set();
      cats.forEach(cat => {
        if (!names.has(cat.name)) {
          names.add(cat.name);
          uniqueCats.push(cat);
        }
      });
      setCategories(uniqueCats);
    });
  }, []);

  useEffect(() => {
    fetchAllRecipes();
  }, [selectedCategory, selectedDifficulty, selectedMaxTime]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedDifficulty, selectedMaxTime]);

  const fetchAllRecipes = async () => {
    setLoading(true);
    try {
      const results = await getFilteredRecipes({ 
        categoryId: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        maxTime: selectedMaxTime || undefined
      });
      setRecipes(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryRecipes = async (catId: string) => {
    setCatLoading(true);
    try {
      const results = await getFilteredRecipes({ categoryId: catId });
      setCategoryRecipes(results);
    } catch (e) {
      console.error(e);
    } finally {
      setCatLoading(false);
    }
  };

  const handleCategorySelect = (id: string | null) => {
    if (!id || selectedCategory === id) {
      setSelectedCategory(null);
      setCategoryRecipes([]);
    } else {
      setSelectedCategory(id);
      fetchCategoryRecipes(id);
    }
  };

  const handleDifficultySelect = (val: number | null) => {
    setSelectedDifficulty(selectedDifficulty === val ? null : val);
  };

  const handleTimeSelect = (val: number | null) => {
    setSelectedMaxTime(selectedMaxTime === val ? null : val);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSelectedMaxTime(null);
    setShowFilters(false);
    setCurrentPage(1);
  };

  const isFiltering = search.trim() !== '' || selectedDifficulty !== null || selectedMaxTime !== null || selectedCategory !== null;
  const isSearchActive = search.trim() !== '';
  const isSheetFilterActive = selectedDifficulty !== null || selectedMaxTime !== null;
  
  // Hide sections if user is searching or using sheet filters
  // If they only selected a category via the accordion, we keep the sections shown
  const shouldHideSections = isSearchActive || isSheetFilterActive;

  // Pagination Logic
  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

  const displayedCategories = showAllCollections ? categories : categories.slice(0, COLLECTION_LIMIT);

  return (
    <div className="space-y-6 px-1">
      <header>
        <h1 className="text-3xl font-serif">{t('catalog.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('catalog.subtitle')}</p>
      </header>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder={t('catalog.searchPlaceholder')}
          className="w-full bg-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-olive outline-hidden transition-all text-sm font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button 
          onClick={() => setShowFilters(true)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl shadow-sm transition-colors ${showFilters || selectedCategory || selectedDifficulty || selectedMaxTime ? 'bg-brand-olive text-white' : 'text-brand-olive bg-white'}`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {!shouldHideSections && (
        <>
          {/* Top Collections (Categories) */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-serif text-xl">{t('catalog.topCollections')}</h3>
              {categories.length > COLLECTION_LIMIT && (
                <button 
                  onClick={() => setShowAllCollections(!showAllCollections)}
                  className="text-[10px] font-bold text-brand-olive uppercase tracking-widest"
                >
                  {showAllCollections ? t('catalog.showLess') : t('catalog.viewAll', { count: categories.length })}
                </button>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {displayedCategories.map((cat) => (
                <div key={cat.id} className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 0.98 }}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`relative h-28 rounded-3xl overflow-hidden group cursor-pointer border-2 transition-all ${selectedCategory === cat.id ? 'border-brand-olive' : 'border-transparent'}`}
                  >
                    <img src={cat.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&fit=crop'} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={categoryLabel(cat)} />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-between px-8 text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                          {getCategoryIcon(cat.name, 20)}
                        </div>
                        <div>
                          <h4 className="text-xl font-serif font-medium">{categoryLabel(cat)}</h4>
                          <span className="text-[10px] uppercase tracking-widest opacity-80">
                            {selectedCategory === cat.id ? t('catalog.viewingCollection') : t('catalog.exploreCollection')}
                          </span>
                        </div>
                      </div>
                      <motion.div 
                        animate={{ rotate: selectedCategory === cat.id ? 90 : 0 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedCategory === cat.id ? 'bg-brand-olive' : 'bg-white/20 backdrop-blur'}`}
                      >
                        <ChevronRight size={20} />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Accordion Content: Category specific horizontal list */}
                  <AnimatePresence>
                    {selectedCategory === cat.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                          {catLoading ? (
                            [1, 2, 3].map(i => (
                              <div key={i} className="w-48 h-64 bg-gray-100 rounded-[32px] animate-pulse shrink-0" />
                            ))
                          ) : categoryRecipes.length > 0 ? (
                            categoryRecipes.map(recipe => (
                              <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="w-48 shrink-0 group">
                                <div className="space-y-2">
                                  <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
                                    <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&fit=crop'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={recipe.title} />
                                  </div>
                                  <h4 className="font-serif text-sm leading-tight truncate px-1">{recipe.title}</h4>
                                  <div className="flex items-center gap-2 text-[8px] font-bold text-gray-400 uppercase tracking-wider px-1">
                                    <Clock size={8} /> {t('common.minutesShort', { count: recipe.prepTime + recipe.cookTime })}
                                  </div>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="w-full py-10 text-center text-xs text-gray-400 italic">
                              {t('catalog.noCollectionRecipes')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* Difficulty Filters */}
          <section className="space-y-4">
            <h3 className="font-serif text-xl px-2">{t('catalog.difficulty')}</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { label: t('catalog.beginner'), val: 1 },
                { label: t('catalog.intermediate'), val: 3 },
                { label: t('catalog.expert'), val: 5 }
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
          <section className="space-y-4">
            <h3 className="font-serif text-xl px-2">{t('catalog.maxTime')}</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[15, 30, 45, 60].map((time) => (
                <button 
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`px-6 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${selectedMaxTime === time ? 'bg-brand-olive border-brand-olive text-white shadow-lg shadow-brand-olive/20' : 'bg-white border-gray-100 text-gray-500'}`}
                >
                  {t('catalog.underMinutes', { count: time })}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Results Section */}
      <section className="space-y-4 pb-10">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-serif text-xl">
            {isFiltering ? t('catalog.searchResults') : t('catalog.allRecipes')}
            {selectedDifficulty ? ` - ${t('common.level', { level: selectedDifficulty })}` : ''}
            {selectedCategory && isFiltering ? ` - ${categoryLabel(categories.find(c => c.id === selectedCategory) || { name: '' })}` : ''}
          </h3>
          {isFiltering && (
            <button onClick={clearFilters} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('common.clear')}</button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-100 rounded-[32px] animate-pulse" />
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentRecipes.map((recipe) => (
                <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="group">
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <div className="aspect-square card-rounded bg-gray-100 overflow-hidden relative">
                      <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={recipe.title} />
                    </div>
                    <h4 className="font-serif text-lg leading-tight truncate">{recipe.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <Clock size={10} /> {t('common.minutesShort', { count: recipe.prepTime + recipe.cookTime })}
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <ChefHat size={10} /> {t('common.level', { level: recipe.difficulty })}
                      {recipe.cuisine && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>{recipe.cuisine}</span>
                        </>
                      )}
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
                  {t('common.pageOf', { page: currentPage, total: totalPages })}
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
            <p className="text-gray-400 text-sm">{t('catalog.noRecipes')}</p>
            {isFiltering && (
              <button 
                onClick={clearFilters}
                className="text-[10px] font-bold text-brand-olive underline uppercase tracking-widest"
              >
                {t('catalog.clearFilters')}
              </button>
            )}
          </div>
        )}
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
                <h2 className="text-3xl font-serif">{t('catalog.filters')}</h2>
                <button onClick={() => setShowFilters(false)}><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('catalog.byCollection')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => handleCategorySelect(selectedCategory === cat.id ? null : cat.id)}
                        className={`px-3 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-tighter transition-all border text-center ${selectedCategory === cat.id ? 'bg-brand-olive border-brand-olive text-white' : 'border-gray-100 text-gray-600'}`}
                      >
                        {categoryLabel(cat)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('catalog.byDifficulty')}</h4>
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
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('catalog.maxTimeShort')}</h4>
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
                  {t('common.apply')}
                </button>
                <button 
                  onClick={clearFilters}
                  className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest py-2"
                >
                  {t('common.reset')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
