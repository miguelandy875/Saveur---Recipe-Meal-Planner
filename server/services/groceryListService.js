import { SHOPPING_CATEGORIES, groceryItemKey, suggestShoppingCategory } from '../utils/shoppingCategories.js';

export function serializeGroceryItem(item) {
  return {
    id: item._id?.toString?.() || item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: suggestShoppingCategory(item.name, item.category),
    checked: Boolean(item.checked),
    source: item.source || 'generated',
  };
}

export function buildGeneratedGroceryItems(entries, ingredientLookup = new Map(), previousItems = []) {
  const previousByKey = new Map(
    previousItems
      .filter((item) => (item.source || 'generated') === 'generated')
      .map((item) => [groceryItemKey(item), item])
  );
  const itemMap = new Map();

  for (const entry of entries) {
    for (const recipeIngredient of entry.recipe?.ingredients || []) {
      const ingredientId = recipeIngredient.ingredient?.toString?.();
      const canonicalIngredient = ingredientId ? ingredientLookup.get(ingredientId) : null;
      const unit = recipeIngredient.unit || canonicalIngredient?.defaultUnit || 'unit';
      const key = groceryItemKey({ name: recipeIngredient.name, unit });
      const previous = previousByKey.get(key);
      const current = itemMap.get(key) || {
        name: recipeIngredient.name,
        quantity: 0,
        unit,
        category: suggestShoppingCategory(recipeIngredient.name, canonicalIngredient?.category),
        checked: Boolean(previous?.checked),
        source: 'generated',
      };

      current.quantity += Number(recipeIngredient.quantity) || 0;
      itemMap.set(key, current);
    }
  }

  return Array.from(itemMap.values()).sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
}

export function mergeCustomItem(items, customItem) {
  const category = suggestShoppingCategory(customItem.name, customItem.category);
  const nextItem = {
    name: customItem.name.trim(),
    quantity: Math.max(0, Number(customItem.quantity) || 0),
    unit: customItem.unit.trim() || 'unit',
    category,
    checked: false,
    source: 'custom',
  };
  const key = groceryItemKey(nextItem);
  const existing = items.find((item) => groceryItemKey(item) === key);

  if (existing) {
    existing.quantity += nextItem.quantity;
    existing.category = category || existing.category || SHOPPING_CATEGORIES.OTHER;
    return items;
  }

  items.push(nextItem);
  return items;
}
