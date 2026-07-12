import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Camera, ChefHat, ChevronLeft, Clock, ImagePlus, Info, Link as LinkIcon, Plus, Trash2, Upload, Users, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../services/AuthContext';
import { createRecipe, getCategories, getRecipeById, updateRecipe, uploadRecipeImage } from '../services/recipeService';
import { useI18n } from '../services/i18n';
import { Category, RecipeIngredient, RecipeStep } from '../types';

const emptyIngredient = (): Omit<RecipeIngredient, 'id'> => ({
  name: '',
  quantity: 1,
  unit: 'g',
  optional: false,
});

export const CreateRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, categoryLabel } = useI18n();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cuisine, setCuisine] = useState('International');
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

  useEffect(() => {
    if (!id || !user) return;

    setLoadingRecipe(true);
    setError('');
    getRecipeById(id)
      .then((recipe) => {
        if (!recipe) {
          setError(t('recipe.notFound'));
          return;
        }

        if (recipe.userId !== user.uid && user.role !== 'admin') {
          setError(t('create.editForbidden'));
          return;
        }

        setTitle(recipe.title);
        setDescription(recipe.description);
        setCategoryId(recipe.categoryId);
        setCuisine(recipe.cuisine || 'International');
        setImageUrl(recipe.imageUrl || '');
        setPrepTime(recipe.prepTime);
        setCookTime(recipe.cookTime);
        setDifficulty(recipe.difficulty);
        setServings(recipe.servings);
        setIsPublic(recipe.isPublic);
        setSteps(
          recipe.steps?.length
            ? recipe.steps.map((step, index) => ({
                order: Number(step.order) || index + 1,
                title: step.title || '',
                description: step.description,
              }))
            : [{ order: 1, title: '', description: '' }]
        );
        setIngredients(
          recipe.ingredients?.length
            ? recipe.ingredients.map((ingredient) => ({
                ingredientId: ingredient.ingredientId,
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                optional: Boolean(ingredient.optional),
                category: ingredient.category,
              }))
            : [emptyIngredient()]
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the recipe.'))
      .finally(() => setLoadingRecipe(false));
  }, [id, user, t]);

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

  const handleImageFile = async (file?: File) => {
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const uploadedUrl = await uploadRecipeImage(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload the image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !categoryId) return;

    setLoading(true);
    setError('');

    try {
      const recipePayload = {
        title,
        description,
        prepTime: Math.max(0, Number(prepTime) || 0),
        cookTime: Math.max(0, Number(cookTime) || 0),
        difficulty: Math.min(5, Math.max(1, Number(difficulty) || 1)),
        servings: Math.max(1, Number(servings) || 1),
        categoryId,
        cuisine,
        userId: user.uid,
        imageUrl,
        isPublic,
      };
      const preparedSteps = steps.filter((step) => step.description.trim() !== '');
      const preparedIngredients = ingredients
        .map((ingredient) => ({
          ...ingredient,
          name: ingredient.name.trim(),
          unit: ingredient.unit.trim() || 'unit',
          quantity: Math.max(0, Number(ingredient.quantity) || 0),
        }))
        .filter((ingredient) => ingredient.name !== '');

      const recipeId = isEditing && id
        ? await updateRecipe(id, recipePayload, preparedSteps, preparedIngredients)
        : await createRecipe(recipePayload, preparedSteps, preparedIngredients);

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
        <h1 className="text-3xl font-serif">{t('create.signInTitle')}</h1>
        <p className="text-sm text-gray-500">{t('create.signInText')}</p>
        <Link to="/profile" className="btn-olive inline-flex items-center justify-center h-12 px-6">
          {t('create.goToAccount')}
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
          <h1 className="text-3xl font-serif">{isEditing ? t('create.editTitle') : t('create.title')}</h1>
          <p className="text-sm text-gray-500">{isEditing ? t('create.editSubtitle') : t('create.subtitle')}</p>
        </div>
      </header>

      {loadingRecipe && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-500">
          {t('common.loading')}...
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group border-2 border-dashed border-gray-200">
              {imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover" alt="Recipe preview" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <ImagePlus size={32} />
                  <span className="text-xs font-bold uppercase tracking-widest text-center px-4">{t('create.imageHelp')}</span>
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center text-brand-olive text-xs font-bold uppercase tracking-widest">
                  {t('create.uploading')}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  handleImageFile(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  handleImageFile(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="h-12 bg-white border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest text-brand-olive flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                {t('create.uploadPhoto')}
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="h-12 bg-white border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest text-brand-olive flex items-center justify-center gap-2"
              >
                <Camera size={16} />
                {t('create.takePhoto')}
              </button>
              <button
                type="button"
                onClick={() => setImageUrl('')}
                disabled={!imageUrl || uploadingImage}
                className="h-12 bg-white border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <X size={16} />
                {t('create.clearImage')}
              </button>
            </div>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder={t('create.recipeTitle')}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 font-serif text-xl focus:ring-2 focus:ring-brand-olive outline-hidden"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
              <div className="relative">
                <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
                  inputMode="url"
                  placeholder={t('create.imageUrl')}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-olive outline-hidden"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                />
              </div>
              <textarea
                placeholder={t('create.description')}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm min-h-[110px] focus:ring-2 focus:ring-brand-olive outline-hidden"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-serif text-xl px-2">{t('create.ingredients')}</h3>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid md:grid-cols-[1fr_100px_100px_44px] gap-2 bg-white p-3 rounded-2xl border border-gray-100">
                  <input
                    type="text"
                    placeholder={t('create.ingredientName')}
                    className="bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden"
                    value={ingredient.name}
                    onChange={(event) => updateIngredient(index, { name: event.target.value })}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={t('create.quantity')}
                    className="bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden"
                    value={ingredient.quantity}
                    onChange={(event) => updateIngredient(index, { quantity: Number(event.target.value) })}
                    required
                  />
                  <input
                    type="text"
                    placeholder={t('create.unit')}
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
                {t('create.addIngredient')}
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-serif text-xl px-2">{t('create.steps')}</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="space-y-3 bg-white p-6 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-olive uppercase tracking-widest">{t('create.step', { count: index + 1 })}</span>
                    <button type="button" onClick={() => removeStep(index)} className="text-gray-300 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden"
                    placeholder={t('create.stepTitle')}
                    value={step.title || ''}
                    onChange={(event) => {
                      const nextSteps = [...steps];
                      nextSteps[index].title = event.target.value;
                      setSteps(nextSteps);
                    }}
                  />
                  <textarea
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-hidden resize-none min-h-[80px]"
                    placeholder={t('create.stepDescription')}
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
                <Plus size={16} /> {t('create.addStep')}
              </button>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 space-y-4">
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={10} /> {t('create.prep')}
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
                <Clock size={10} /> {t('create.cook')}
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
                <ChefHat size={10} /> {t('create.level')}
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
                <Users size={10} /> {t('create.servings')}
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
              <Info size={10} /> {t('create.category')}
            </label>
            <select
              className="w-full font-serif text-sm outline-hidden bg-transparent"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              <option value="">{t('create.selectCategory')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {categoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <ChefHat size={10} /> {t('common.cuisine')}
            </label>
            <select
              className="w-full font-serif text-sm outline-hidden bg-transparent"
              value={cuisine}
              onChange={(event) => setCuisine(event.target.value)}
            >
              {['International', 'Italian', 'French', 'Spanish', 'Burundian / East African', 'Mediterranean'].map((option) => (
                <option key={option} value={option}>
                  {option}
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
            <span className="text-sm font-medium text-gray-600">{t('create.visiblePublic')}</span>
          </label>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl p-4">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || loadingRecipe || !categoryId}
            className="w-full btn-olive py-5 shadow-xl shadow-brand-olive/20 disabled:opacity-50"
          >
            {loading ? t('create.saving') : isEditing ? t('create.updateRecipe') : t('create.saveRecipe')}
          </motion.button>
        </aside>
      </form>
    </div>
  );
};
