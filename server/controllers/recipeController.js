import { Category } from '../models/Category.js';
import { Favorite } from '../models/Favorite.js';
import { Ingredient } from '../models/Ingredient.js';
import { Recipe } from '../models/Recipe.js';
import { computeRecipeNutritionFor } from '../services/nutritionService.js';
import { suggestNutritionCode } from '../utils/nutritionCodes.js';
import { suggestShoppingCategory } from '../utils/shoppingCategories.js';

async function favoriteIdSet(userId, recipeIds) {
  if (!userId || recipeIds.length === 0) {
    return new Set();
  }

  const favorites = await Favorite.find({ user: userId, recipe: { $in: recipeIds } }).select('recipe');
  return new Set(favorites.map((favorite) => favorite.recipe.toString()));
}

function serializeNutrition(nutrition) {
  if (!nutrition) return null;

  return {
    status: nutrition.status,
    totalCalories: nutrition.totalCalories ?? null,
    totalProteins: nutrition.totalProteins ?? null,
    totalCarbs: nutrition.totalCarbs ?? null,
    totalFats: nutrition.totalFats ?? null,
    approximate: Boolean(nutrition.approximate),
    perServing: nutrition.perServing
      ? {
          calories: nutrition.perServing.calories,
          proteins: nutrition.perServing.proteins,
          carbs: nutrition.perServing.carbs,
          fats: nutrition.perServing.fats,
        }
      : null,
    allergens: nutrition.allergens || [],
    skippedIngredients: (nutrition.skippedIngredients || []).map((item) => ({ name: item.name, reason: item.reason })),
    warnings: nutrition.warnings || [],
    unavailableReason: nutrition.unavailableReason || null,
    computedAt: nutrition.computedAt || null,
    source: nutrition.source,
  };
}

function serializeRecipe(recipe, favoriteIds = new Set()) {
  const recipeObject = recipe.toObject ? recipe.toObject() : recipe;
  const id = recipeObject._id.toString();
  const category = recipeObject.category;
  const owner = recipeObject.user;

  return {
    id,
    title: recipeObject.title,
    description: recipeObject.description,
    prepTime: recipeObject.prepTime,
    cookTime: recipeObject.cookTime,
    difficulty: recipeObject.difficulty,
    servings: recipeObject.servings,
    categoryId: category?._id?.toString?.() || category?.toString?.() || '',
    categoryName: category?.name || '',
    categorySlug: category?.slug || '',
    cuisine: recipeObject.cuisine || 'International',
    userId: owner?._id?.toString?.() || owner?.toString?.() || '',
    userName: owner?.name || '',
    imageUrl: recipeObject.imageUrl,
    isPublic: recipeObject.isPublic,
    ingredients: (recipeObject.ingredients || []).map((ingredient) => ({
      id: ingredient._id?.toString?.() || `${id}-${ingredient.name}`,
      ingredientId: ingredient.ingredient?.toString?.() || '',
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      optional: ingredient.optional,
    })),
    steps: (recipeObject.steps || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((step) => ({
        id: step._id?.toString?.() || `${id}-${step.order}`,
        order: step.order,
        title: step.title,
        description: step.description,
      })),
    nutrition: serializeNutrition(recipeObject.nutrition),
    isFavorite: favoriteIds.has(id),
    createdAt: recipeObject.createdAt,
  };
}

async function normalizeIngredients(ingredients = []) {
  const normalized = [];

  for (const item of ingredients) {
    const name = (item.name || item.ingredientId || '').toString().trim();
    if (!name) continue;

    const unit = (item.unit || 'unit').toString().trim();
    const ingredient = await Ingredient.findOneAndUpdate(
      { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      {
        $setOnInsert: {
          name,
          defaultUnit: unit,
          nutritionCode: suggestNutritionCode(name),
        },
        $set: {
          category: suggestShoppingCategory(name, item.category),
        },
      },
      { new: true, upsert: true }
    );

    // Ingredients created before the nutrition feature have no code yet: backfill it (never overwrite a curated one).
    if (!ingredient.nutritionCode) {
      ingredient.nutritionCode = suggestNutritionCode(ingredient.name);
      await Ingredient.updateOne(
        { _id: ingredient._id, nutritionCode: { $in: [null, ''] } },
        { $set: { nutritionCode: ingredient.nutritionCode } }
      );
    }

    normalized.push({
      ingredient: ingredient._id,
      name: ingredient.name,
      quantity: Number(item.quantity) || 1,
      unit,
      optional: Boolean(item.optional),
    });
  }

  return normalized;
}

export async function listRecipes(req, res, next) {
  try {
    const filter = { isPublic: true };
    const { search, categoryId, difficulty, maxTime } = req.query;

    if (categoryId) {
      filter.category = categoryId;
    }

    if (difficulty) {
      filter.difficulty = Number(difficulty);
    }

    if (search) {
      filter.$text = { $search: search.toString() };
    }

    if (maxTime) {
      filter.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, Number(maxTime)] };
    }

    const recipes = await Recipe.find(filter)
      .populate('category', 'name slug image')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    const favorites = await favoriteIdSet(req.user?._id, recipes.map((recipe) => recipe._id));

    res.json({ data: recipes.map((recipe) => serializeRecipe(recipe, favorites)) });
  } catch (error) {
    next(error);
  }
}

export async function listUserRecipes(req, res, next) {
  try {
    const recipes = await Recipe.find({ user: req.user._id })
      .populate('category', 'name slug image')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const favorites = await favoriteIdSet(req.user._id, recipes.map((recipe) => recipe._id));

    res.json({ data: recipes.map((recipe) => serializeRecipe(recipe, favorites)) });
  } catch (error) {
    next(error);
  }
}

export async function getRecipe(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('category', 'name slug image')
      .populate('user', 'name');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const ownsRecipe = req.user && recipe.user._id.toString() === req.user._id.toString();
    if (!recipe.isPublic && !ownsRecipe && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'This recipe is private.' });
    }

    const favorites = await favoriteIdSet(req.user?._id, [recipe._id]);
    res.json({ data: serializeRecipe(recipe, favorites) });
  } catch (error) {
    next(error);
  }
}

export async function createRecipe(req, res, next) {
  try {
    const {
      title,
      description,
      prepTime,
      cookTime,
      difficulty,
      servings,
      categoryId,
      cuisine,
      imageUrl,
      isPublic,
      steps,
      ingredients,
    } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Please select a valid recipe category.' });
    }

    const normalizedSteps = (steps || [])
      .filter((step) => step.description?.trim())
      .map((step, index) => ({
        order: Number(step.order) || index + 1,
        title: step.title || '',
        description: step.description.trim(),
      }));

    const normalizedIngredients = await normalizeIngredients(ingredients);

    if (normalizedSteps.length === 0 || normalizedIngredients.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient and one preparation step are required.' });
    }

    // Never throws: when the legacy service is down the recipe is still created, with nutrition "unavailable".
    const nutrition = await computeRecipeNutritionFor(normalizedIngredients, Number(servings));

    const recipe = await Recipe.create({
      title,
      description,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      difficulty: Number(difficulty),
      servings: Number(servings),
      category: category._id,
      cuisine: cuisine || 'International',
      user: req.user._id,
      imageUrl,
      isPublic: isPublic !== false,
      ingredients: normalizedIngredients,
      steps: normalizedSteps,
      nutrition,
    });

    const populated = await Recipe.findById(recipe._id)
      .populate('category', 'name slug image')
      .populate('user', 'name');

    res.status(201).json({ data: serializeRecipe(populated) });
  } catch (error) {
    next(error);
  }
}

export async function updateRecipe(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const ownsRecipe = recipe.user.toString() === req.user._id.toString();
    if (!ownsRecipe && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can edit only your own recipes.' });
    }

    const {
      title,
      description,
      prepTime,
      cookTime,
      difficulty,
      servings,
      categoryId,
      cuisine,
      imageUrl,
      isPublic,
      steps,
      ingredients,
    } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Please select a valid recipe category.' });
    }

    const normalizedSteps = (steps || [])
      .filter((step) => step.description?.trim())
      .map((step, index) => ({
        order: Number(step.order) || index + 1,
        title: step.title || '',
        description: step.description.trim(),
      }));

    const normalizedIngredients = await normalizeIngredients(ingredients);

    if (normalizedSteps.length === 0 || normalizedIngredients.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient and one preparation step are required.' });
    }

    const nutrition = await computeRecipeNutritionFor(normalizedIngredients, Number(servings));

    recipe.set({
      title,
      description,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      difficulty: Number(difficulty),
      servings: Number(servings),
      category: category._id,
      cuisine: cuisine || 'International',
      imageUrl,
      isPublic: isPublic !== false,
      ingredients: normalizedIngredients,
      steps: normalizedSteps,
      nutrition,
    });

    await recipe.save();

    const populated = await Recipe.findById(recipe._id)
      .populate('category', 'name slug image')
      .populate('user', 'name');

    const favorites = await favoriteIdSet(req.user?._id, [recipe._id]);
    res.json({ data: serializeRecipe(populated, favorites) });
  } catch (error) {
    next(error);
  }
}

// POST /api/recipes/:id/nutrition/refresh - recompute the nutrition on demand (e.g. after an outage).
export async function refreshRecipeNutrition(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const ownsRecipe = recipe.user.toString() === req.user._id.toString();
    if (!ownsRecipe && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can refresh the nutrition of your own recipes only.' });
    }

    const nutrition = await computeRecipeNutritionFor(recipe.ingredients, recipe.servings);

    // Do not overwrite good data with an "unavailable" marker: report the outage instead.
    if (nutrition.status === 'unavailable') {
      return res.status(503).json({ message: `Nutrition could not be computed: ${nutrition.unavailableReason}` });
    }

    recipe.nutrition = nutrition;
    await recipe.save();

    const populated = await Recipe.findById(recipe._id)
      .populate('category', 'name slug image')
      .populate('user', 'name');

    res.json({ data: serializeRecipe(populated) });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecipe(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const ownsRecipe = recipe.user.toString() === req.user._id.toString();
    if (!ownsRecipe && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can delete only your own recipes.' });
    }

    await Recipe.deleteOne({ _id: recipe._id });
    await Favorite.deleteMany({ recipe: recipe._id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
