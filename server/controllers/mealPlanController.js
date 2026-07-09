import { MealPlan } from '../models/MealPlan.js';
import { Recipe } from '../models/Recipe.js';

function serializeEntry(entry) {
  const recipe = entry.recipe;

  return {
    id: entry._id.toString(),
    userId: entry.user.toString(),
    date: entry.date,
    recipeId: recipe?._id?.toString?.() || entry.recipe.toString(),
    mealType: entry.mealType,
    recipe: recipe
      ? {
          id: recipe._id.toString(),
          title: recipe.title,
          description: recipe.description,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          difficulty: recipe.difficulty,
          servings: recipe.servings,
          imageUrl: recipe.imageUrl,
          categoryId: recipe.category?.toString?.() || '',
          userId: recipe.user?.toString?.() || '',
          isPublic: recipe.isPublic,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
        }
      : null,
  };
}

export async function getMealPlan(req, res, next) {
  try {
    const { date, start, end } = req.query;
    const filter = { user: req.user._id };

    if (date) {
      filter.date = date.toString();
    } else if (start && end) {
      filter.date = { $gte: start.toString(), $lte: end.toString() };
    }

    const entries = await MealPlan.find(filter)
      .populate('recipe')
      .sort({ date: 1, mealType: 1 });

    res.json({ data: entries.map(serializeEntry) });
  } catch (error) {
    next(error);
  }
}

export async function upsertMealPlan(req, res, next) {
  try {
    const { date, recipeId, mealType } = req.body;
    const recipe = await Recipe.findById(recipeId);

    if (!date || !recipe || !mealType) {
      return res.status(400).json({ message: 'Date, recipe and meal type are required.' });
    }

    const entry = await MealPlan.findOneAndUpdate(
      { user: req.user._id, date, mealType },
      { user: req.user._id, date, recipe: recipe._id, mealType },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('recipe');

    res.status(201).json({ data: serializeEntry(entry) });
  } catch (error) {
    next(error);
  }
}

export async function removeMealPlan(req, res, next) {
  try {
    const entry = await MealPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!entry) {
      return res.status(404).json({ message: 'Meal plan entry not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
