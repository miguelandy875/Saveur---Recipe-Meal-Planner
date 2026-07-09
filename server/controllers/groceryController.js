import { MealPlan } from '../models/MealPlan.js';
import { ShoppingList } from '../models/ShoppingList.js';

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export async function generateGroceryList(req, res, next) {
  try {
    const weekStart = (req.query.weekStart || new Date().toISOString().slice(0, 10)).toString();
    const weekEnd = addDays(weekStart, 6);
    const entries = await MealPlan.find({
      user: req.user._id,
      date: { $gte: weekStart, $lte: weekEnd },
    }).populate('recipe');

    const itemMap = new Map();

    for (const entry of entries) {
      for (const ingredient of entry.recipe?.ingredients || []) {
        const key = `${ingredient.name.toLowerCase()}|${ingredient.unit.toLowerCase()}`;
        const current = itemMap.get(key) || {
          name: ingredient.name,
          quantity: 0,
          unit: ingredient.unit,
          category: 'Meal plan',
          checked: false,
        };

        current.quantity += Number(ingredient.quantity) || 0;
        itemMap.set(key, current);
      }
    }

    const items = Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    const list = await ShoppingList.findOneAndUpdate(
      { user: req.user._id, weekStart },
      { user: req.user._id, weekStart, items },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      data: list.items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        checked: item.checked,
      })),
    });
  } catch (error) {
    next(error);
  }
}
