import { Favorite } from '../models/Favorite.js';
import { Recipe } from '../models/Recipe.js';

function serializeFavoriteRecipe(recipe) {
  return {
    id: recipe._id.toString(),
    title: recipe.title,
    description: recipe.description,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    categoryId: recipe.category?._id?.toString?.() || '',
    categoryName: recipe.category?.name || '',
    userId: recipe.user?._id?.toString?.() || '',
    userName: recipe.user?.name || '',
    imageUrl: recipe.imageUrl,
    isPublic: recipe.isPublic,
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    isFavorite: true,
    createdAt: recipe.createdAt,
  };
}

export async function listFavorites(req, res, next) {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'recipe',
        populate: [
          { path: 'category', select: 'name image' },
          { path: 'user', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({
      data: favorites
        .filter((favorite) => favorite.recipe)
        .map((favorite) => serializeFavoriteRecipe(favorite.recipe)),
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleFavorite(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const existing = await Favorite.findOne({ user: req.user._id, recipe: recipe._id });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ isFavorite: false });
    }

    await Favorite.create({ user: req.user._id, recipe: recipe._id });
    res.status(201).json({ isFavorite: true });
  } catch (error) {
    next(error);
  }
}
