import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, ChefHat, ChevronLeft, Clock, Info, Plus, Trash2, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../services/AuthContext';
import { createRecipe, getCategories } from '../services/recipeService';
import { Category, RecipeIngredient, RecipeStep } from '../types';

const emptyIngredient = (): Omit<RecipeIngredient, 'id'> => ({
  name: '',
  quantity: 1,
  unit: 'g',
  optional: false,
});

export const CreateRecipe: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    { order: 1, title: '', description: '' },
  ]);
  const [ingredients, setIngredients] = useState<Omit<RecipeIngredient, 'id'>[]>([emptyIngredient()]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const addStep = () => {
    setSteps([...steps, { order: steps.length + 1, title: '', description: '' }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 })));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, emptyIngredient()]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, patch: Partial<Omit<RecipeIngredient, 'id'>>) => {
    setIngredients(ingredients.map((ingredient, i) => (i === index ? { ...ingredient, ...patch } : ingredient)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !categoryId) return;

    setLoading(true);
    setError('');

    try {
      const recipeId = await createRecipe(
        {
          title,
          description,
          prepTime: Math.max(0, Number(prepTime) || 0),
          cookTime: Math.max(0, Number(cookTime) || 0),
          difficulty: Math.min(5, Math.max(1, Number(difficulty) || 1)),
          servings: Math.max(1, Number(servings) || 1),
          categoryId,
          userId: user.uid,
          imageUrl,
          isPublic,
        },
        steps.filter((step) => step.description.trim() !== ''),
        ingredients
          .map((ingredient) => ({
            ...ingredient,
            name: ingredient.name.trim(),
            unit: ingredient.unit.trim() || 'unit',
            quantity: Math.max(0, Number(ingredient.quantity) || 0),
          }))
          .filter((ingredient) => ingredient.name !== '')
      );

      navigate(`/recipe/${recipeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the recipe.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm space-y-4">
        <ChefHat size={42} className="mx-auto text-brand-olive" />
        <h1 className="text-3xl font-serif">Sign in to create recipes</h1>
        <p className="text-sm text-gray-500">
          The assignment requires authenticated users for personal recipes, favorites and planning.
        </p>
        <Link to="/profile" className="btn-olive inline-flex items-center justify-center h-12 px-6">
          Go to account
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-brand-olive">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-serif">Create Recipe</h1>
          <p className="text-sm text-gray-500">Save ingredients, quantities, units and preparation steps.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group border-2 border-dashed border-gray-200">
              {imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover" alt="Recipe preview" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Camera size={32} />
                  <span className="text-xs font-bold uppercase tracking-widest text-center px-4">Paste an image URL to preview</span>
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Recipe title"
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 font-serif text-xl focus:ring-2 focus:ring-brand-olive outline-hidden"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
              <input
                type="url"
                placeholder="Image URL"
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-olive outline-hidden"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
              />
              <textarea
                placeholder="Brief description"
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm min-h-[110px] focus:ring-2 focus:ring-brand-olive outline-hidden"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-serif text-xl px-2">Ingredients</h3>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid md:grid-cols-[1fr_100px_100px_44px] gap-2 bg-white p-3 rounded-2xl border border-gray-100">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    className="bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden"
                    value={ingredient.name}
                    onChange={(event) => updateIngredient(index, { name: event.target.value })}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Qty"
                    className="bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden"
                    value={ingredient.quantity}
                    onChange={(event) => updateIngredient(index, { quantity: Number(event.target.value) })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    className="bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden"
                    value={ingredient.unit}
                    onChange={(event) => updateIngredient(index, { unit: event.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-300 hover:text-red-500 transition-colors flex items-center justify-center"
                    aria-label="Remove ingredient"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 uppercase tracking-widest hover:border-brand-olive hover:text-brand-olive transition-all"
              >
                Add ingredient
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-serif text-xl px-2">Preparation Steps</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="space-y-3 bg-white p-6 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-olive uppercase tracking-widest">Step {index + 1}</span>
                    <button type="button" onClick={() => removeStep(index)} className="text-gray-300 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden"
                    placeholder="Short step title"
                    value={step.title || ''}
                    onChange={(event) => {
                      const nextSteps = [...steps];
                      nextSteps[index].title = event.target.value;
                      setSteps(nextSteps);
                    }}
                  />
                  <textarea
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden resize-none min-h-[80px]"
                    placeholder="Describe this step"
                    value={step.description}
                    onChange={(event) => {
                      const nextSteps = [...steps];
                      nextSteps[index].description = event.target.value;
                      setSteps(nextSteps);
                    }}
                    required
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="w-full py-4 bg-brand-olive/5 text-brand-olive rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add step
              </button>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 space-y-4">
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={10} /> Prep
              </label>
              <input
                type="number"
                min="0"
                className="w-full font-serif text-lg outline-hidden"
                value={prepTime}
                onChange={(event) => setPrepTime(Number(event.target.value))}
              />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={10} /> Cook
              </label>
              <input
                type="number"
                min="0"
                className="w-full font-serif text-lg outline-hidden"
                value={cookTime}
                onChange={(event) => setCookTime(Number(event.target.value))}
              />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <ChefHat size={10} /> Level
              </label>
              <input
                type="number"
                min="1"
                max="5"
                className="w-full font-serif text-lg outline-hidden"
                value={difficulty}
                onChange={(event) => setDifficulty(Number(event.target.value))}
              />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Users size={10} /> Servings
              </label>
              <input
                type="number"
                min="1"
                className="w-full font-serif text-lg outline-hidden"
                value={servings}
                onChange={(event) => setServings(Number(event.target.value))}
              />
            </div>
          </section>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Info size={10} /> Category
            </label>
            <select
              className="w-full font-serif text-sm outline-hidden bg-transparent"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="w-5 h-5 accent-brand-olive"
            />
            <span className="text-sm font-medium text-gray-600">Visible in the public catalog</span>
          </label>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl p-4">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !categoryId}
            className="w-full btn-olive py-5 shadow-xl shadow-brand-olive/20 disabled:opacity-50"
          >
            {loading ? 'Saving recipe...' : 'Save Recipe'}
          </motion.button>
        </aside>
      </form>
    </div>
  );
};
