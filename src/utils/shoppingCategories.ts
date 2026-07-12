import { ShoppingCategory } from '../types';

export const SHOPPING_CATEGORY_ORDER: ShoppingCategory[] = [
  'DAIRY',
  'PRODUCE',
  'PASTA_GRAINS',
  'PANTRY',
  'MEAT_PROTEIN',
  'BAKERY',
  'FROZEN',
  'BEVERAGES',
  'OTHER',
];

const aliases: Record<ShoppingCategory, string[]> = {
  DAIRY: ['milk', 'butter', 'cheese', 'cream', 'heavy cream', 'yogurt', 'greek yogurt', 'yoghurt', 'yaourt', 'yaourt grec', 'gorgonzola', 'mozzarella'],
  PRODUCE: ['tomato', 'tomatoes', 'tomate', 'onion', 'onions', 'spinach', 'avocado', 'blueberry', 'blueberries', 'lemon', 'basil', 'lettuce', 'cucumber', 'plantain', 'banana', 'potato', 'potatoes', 'mango', 'corn'],
  PASTA_GRAINS: ['pasta', 'spaghetti', 'tagliatelle', 'fresh tagliatelle', 'macaroni', 'rice', 'oats', 'oat', 'couscous'],
  PANTRY: ['flour', 'sugar', 'oil', 'olive oil', 'spice', 'spices', 'walnut', 'walnuts', 'chickpea', 'chickpeas', 'bean', 'beans', 'peanut butter', 'chocolate', 'honey'],
  MEAT_PROTEIN: ['chicken', 'beef', 'fish', 'egg', 'eggs', 'tuna'],
  BAKERY: ['bread', 'baguette', 'bun', 'buns', 'roll', 'rolls'],
  FROZEN: ['frozen peas', 'ice cream', 'frozen vegetables', 'frozen berries'],
  BEVERAGES: ['water', 'juice', 'tea', 'coffee', 'soda', 'wine'],
  OTHER: [],
};

const aliasMap = new Map(
  Object.entries(aliases).flatMap(([category, names]) =>
    names.map((name) => [normalizeIngredientName(name), category as ShoppingCategory])
  )
);

export function normalizeIngredientName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function suggestShoppingCategory(name: string): ShoppingCategory {
  const normalized = normalizeIngredientName(name);
  if (aliasMap.has(normalized)) return aliasMap.get(normalized)!;

  if (normalized.endsWith('ies')) {
    const singular = `${normalized.slice(0, -3)}y`;
    if (aliasMap.has(singular)) return aliasMap.get(singular)!;
  }

  if (normalized.endsWith('s')) {
    const singular = normalized.slice(0, -1);
    if (aliasMap.has(singular)) return aliasMap.get(singular)!;
  }

  return 'OTHER';
}
