import { Ingredient } from '../models/Ingredient.js';
import { suggestShoppingCategory } from '../utils/shoppingCategories.js';

export async function listIngredients(req, res, next) {
  try {
    const search = (req.query.search || '').toString().trim();
    const filter = search ? { name: new RegExp(search, 'i') } : {};
    const ingredients = await Ingredient.find(filter).sort({ name: 1 }).limit(100);

    res.json({
      data: ingredients.map((ingredient) => ({
        id: ingredient._id.toString(),
        name: ingredient.name,
        unit: ingredient.defaultUnit,
        category: suggestShoppingCategory(ingredient.name, ingredient.category),
        caloriesPerUnit: ingredient.caloriesPerUnit,
      })),
    });
  } catch (error) {
    next(error);
  }
}
