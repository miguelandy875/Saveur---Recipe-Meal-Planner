import { MealPlan } from '../models/MealPlan.js';
import { Ingredient } from '../models/Ingredient.js';
import { ShoppingList } from '../models/ShoppingList.js';
import { buildGeneratedGroceryItems, mergeCustomItem, serializeGroceryItem } from '../services/groceryListService.js';
import { suggestShoppingCategory } from '../utils/shoppingCategories.js';

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

    const ingredientIds = [
      ...new Set(
        entries.flatMap((entry) =>
          (entry.recipe?.ingredients || [])
            .map((ingredient) => ingredient.ingredient?.toString?.())
            .filter(Boolean)
        )
      ),
    ];
    const canonicalIngredients = await Ingredient.find({ _id: { $in: ingredientIds } });
    const ingredientLookup = new Map(
      canonicalIngredients.map((ingredient) => [ingredient._id.toString(), ingredient])
    );
    const existingList = await ShoppingList.findOne({ user: req.user._id, weekStart });
    const previousItems = existingList?.items || [];
    const generatedItems = buildGeneratedGroceryItems(entries, ingredientLookup, previousItems);
    const customItems = previousItems
      .filter((item) => item.source === 'custom')
      .map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: suggestShoppingCategory(item.name, item.category),
        checked: item.checked,
        source: 'custom',
      }));

    const items = [...generatedItems];
    for (const customItem of customItems) {
      mergeCustomItem(items, customItem);
    }

    const list = await ShoppingList.findOneAndUpdate(
      { user: req.user._id, weekStart },
      { user: req.user._id, weekStart, items },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      data: list.items.map(serializeGroceryItem),
    });
  } catch (error) {
    next(error);
  }
}

export async function addCustomGroceryItem(req, res, next) {
  try {
    const weekStart = (req.body.weekStart || new Date().toISOString().slice(0, 10)).toString();
    const name = (req.body.name || '').toString().trim();
    const unit = (req.body.unit || 'unit').toString().trim() || 'unit';
    const quantity = Number(req.body.quantity) || 1;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required.' });
    }

    const list = await ShoppingList.findOneAndUpdate(
      { user: req.user._id, weekStart },
      { $setOnInsert: { user: req.user._id, weekStart, items: [] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    mergeCustomItem(list.items, {
      name,
      unit,
      quantity,
      category: req.body.category,
      source: 'custom',
    });
    await list.save();

    res.status(201).json({ data: list.items.map(serializeGroceryItem) });
  } catch (error) {
    next(error);
  }
}

export async function updateGroceryItem(req, res, next) {
  try {
    const { weekStart, checked } = req.body;
    const list = await ShoppingList.findOne({ user: req.user._id, weekStart: weekStart?.toString() });

    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found.' });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Shopping item not found.' });
    }

    item.checked = Boolean(checked);
    await list.save();

    res.json({ data: serializeGroceryItem(item) });
  } catch (error) {
    next(error);
  }
}

export async function removeGroceryItem(req, res, next) {
  try {
    const weekStart = (req.query.weekStart || '').toString();
    const list = await ShoppingList.findOne({ user: req.user._id, weekStart });

    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found.' });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Shopping item not found.' });
    }

    item.deleteOne();
    await list.save();

    res.json({ data: list.items.map(serializeGroceryItem) });
  } catch (error) {
    next(error);
  }
}
