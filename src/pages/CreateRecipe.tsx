import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Plus, Trash2, Clock, ChefHat, Users, Info, Camera } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { createRecipe, getCategories } from '../services/recipeService';
import { Category, RecipeStep, RecipeIngredient } from '../types';

export const CreateRecipe: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState(20);
  const [cookTime, setCookTime] = useState(15);
  const [difficulty, setDifficulty] = useState(2);
  const [servings, setServings] = useState(4);
  const [isPublic, setIsPublic] = useState(true);

  const [steps, setSteps] = useState<Omit<RecipeStep, 'id'>[]>([
    { order: 1, description: '' }
  ]);
  const [ingredients, setIngredients] = useState<Omit<RecipeIngredient, 'id'>[]>([
    { ingredientId: 'manual', quantity: 1, optional: false }
  ]);
  // We'll use a simplified version where users just type the ingredient name for now
  const [ingredientNames, setIngredientNames] = useState<string[]>(['']);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, description: '' }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(newSteps);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredientId: 'manual', quantity: 1, optional: false }]);
    setIngredientNames([...ingredientNames, '']);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
    setIngredientNames(ingredientNames.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryId) return;

    setLoading(true);
    try {
      const recipeId = await createRecipe(
        {
          title,
          description,
          prepTime,
          cookTime,
          difficulty,
          servings,
          categoryId,
          userId: user.uid,
          imageUrl,
          isPublic,
        },
        steps.filter(s => s.description.trim() !== ''),
        ingredients.map((ing, i) => ({
          ...ing,
          // In a real app, we'd link to master ingredients, but here we'll store the name in place
          // for the sake of simplicity in this mobile UI prototype
          ingredientId: ingredientNames[i] || 'Unknown'
        })).filter(ing => ing.ingredientId.trim() !== '')
      );

      if (recipeId) {
        navigate(`/recipe/${recipeId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif">Create Recipe</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="space-y-4">
          <div className="aspect-video bg-gray-100 rounded-[32px] overflow-hidden relative group border-2 border-dashed border-gray-200">
            {imageUrl ? (
              <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Camera size={32} />
                <span className="text-xs font-bold uppercase tracking-widest text-balance text-center px-4">Insert image URL below to preview</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Recipe Title" 
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 font-serif text-xl focus:ring-2 focus:ring-brand-olive outline-hidden"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="Image URL (e.g. Unsplash link)" 
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-olive outline-hidden"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <textarea 
              placeholder="Brief description..." 
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm min-h-[100px] focus:ring-2 focus:ring-brand-olive outline-hidden"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </section>

        {/* Metadata */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Clock size={10} /> Prep Time (min)
            </label>
            <input 
              type="number" 
              className="w-full font-serif text-lg outline-hidden"
              value={prepTime}
              onChange={(e) => setPrepTime(parseInt(e.target.value))}
            />
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <ChefHat size={10} /> Difficulty (1-5)
            </label>
            <input 
              type="number" min="1" max="5"
              className="w-full font-serif text-lg outline-hidden"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
            />
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Users size={10} /> Servings
            </label>
            <input 
              type="number" 
              className="w-full font-serif text-lg outline-hidden"
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value))}
            />
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Info size={10} /> Category
            </label>
            <select 
              className="w-full font-serif text-sm outline-hidden bg-transparent"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Ingredients */}
        <section className="space-y-4">
          <h3 className="font-serif text-xl px-2">Ingredients</h3>
          <div className="space-y-3">
            {ingredientNames.map((name, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ingredient name"
                  className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-hidden"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...ingredientNames];
                    newNames[i] = e.target.value;
                    setIngredientNames(newNames);
                  }}
                />
                <button 
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="p-3 text-red-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button 
              type="button"
              onClick={addIngredient}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 uppercase tracking-widest hover:border-brand-olive transition-all"
            >
              + Add Ingredient
            </button>
          </div>
        </section>

        {/* Steps */}
        <section className="space-y-4">
          <h3 className="font-serif text-xl px-2">Instructions</h3>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="space-y-2 bg-white p-6 rounded-3xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-brand-olive uppercase tracking-widest">Step {i + 1}</span>
                  <button type="button" onClick={() => removeStep(i)} className="text-gray-300"><Trash2 size={16} /></button>
                </div>
                <textarea 
                  className="w-full text-sm outline-hidden resize-none min-h-[60px]"
                  placeholder="What to do next?"
                  value={step.description}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[i].description = e.target.value;
                    setSteps(newSteps);
                  }}
                />
              </div>
            ))}
            <button 
              type="button"
              onClick={addStep}
              className="w-full py-4 bg-brand-olive/5 text-brand-olive rounded-3xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Step
            </button>
          </div>
        </section>

        <div className="flex items-center gap-3 px-2">
          <input 
            type="checkbox" 
            id="public" 
            checked={isPublic} 
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-5 h-5 accent-brand-olive"
          />
          <label htmlFor="public" className="text-sm font-medium text-gray-600">Make this recipe visible to everyone</label>
        </div>

        <button 
          type="submit" 
          disabled={loading || !categoryId}
          className="w-full btn-olive py-5 shadow-xl shadow-brand-olive/20 disabled:opacity-50"
        >
          {loading ? 'Creating Recipe...' : 'Save Recipe'}
        </button>
      </form>
    </div>
  );
};
