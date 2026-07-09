import { Favorite } from '../models/Favorite.js';
import { MealPlan } from '../models/MealPlan.js';
import { Recipe } from '../models/Recipe.js';
import { ShoppingList } from '../models/ShoppingList.js';

export async function getDashboard(req, res, next) {
  try {
    const [recipes, favorites, plannedMeals, latestList] = await Promise.all([
      Recipe.countDocuments({ user: req.user._id }),
      Favorite.countDocuments({ user: req.user._id }),
      MealPlan.countDocuments({ user: req.user._id }),
      ShoppingList.findOne({ user: req.user._id }).sort({ updatedAt: -1 }),
    ]);

    res.json({
      data: {
        recipes,
        favorites,
        plannedMeals,
        groceryItems: latestList?.items?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}
