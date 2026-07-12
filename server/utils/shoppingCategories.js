export const SHOPPING_CATEGORIES = Object.freeze({
  DAIRY: 'DAIRY',
  PRODUCE: 'PRODUCE',
  PASTA_GRAINS: 'PASTA_GRAINS',
  PANTRY: 'PANTRY',
  MEAT_PROTEIN: 'MEAT_PROTEIN',
  BAKERY: 'BAKERY',
  FROZEN: 'FROZEN',
  BEVERAGES: 'BEVERAGES',
  OTHER: 'OTHER',
});

export const SHOPPING_CATEGORY_ORDER = Object.freeze([
  SHOPPING_CATEGORIES.DAIRY,
  SHOPPING_CATEGORIES.PRODUCE,
  SHOPPING_CATEGORIES.PASTA_GRAINS,
  SHOPPING_CATEGORIES.PANTRY,
  SHOPPING_CATEGORIES.MEAT_PROTEIN,
  SHOPPING_CATEGORIES.BAKERY,
  SHOPPING_CATEGORIES.FROZEN,
  SHOPPING_CATEGORIES.BEVERAGES,
  SHOPPING_CATEGORIES.OTHER,
]);

const LEGACY_CATEGORY_MAP = new Map([
  ['dairy', SHOPPING_CATEGORIES.DAIRY],
  ['produce', SHOPPING_CATEGORIES.PRODUCE],
  ['pasta', SHOPPING_CATEGORIES.PASTA_GRAINS],
  ['grain', SHOPPING_CATEGORIES.PASTA_GRAINS],
  ['grains', SHOPPING_CATEGORIES.PASTA_GRAINS],
  ['pantry', SHOPPING_CATEGORIES.PANTRY],
  ['protein', SHOPPING_CATEGORIES.MEAT_PROTEIN],
  ['meat', SHOPPING_CATEGORIES.MEAT_PROTEIN],
  ['bakery', SHOPPING_CATEGORIES.BAKERY],
  ['frozen', SHOPPING_CATEGORIES.FROZEN],
  ['beverage', SHOPPING_CATEGORIES.BEVERAGES],
  ['beverages', SHOPPING_CATEGORIES.BEVERAGES],
  ['other', SHOPPING_CATEGORIES.OTHER],
  ['custom', SHOPPING_CATEGORIES.OTHER],
  ['meal plan', SHOPPING_CATEGORIES.OTHER],
]);

const CATEGORY_ALIASES = [
  {
    category: SHOPPING_CATEGORIES.DAIRY,
    names: [
      'milk',
      'butter',
      'cheese',
      'cream',
      'heavy cream',
      'yogurt',
      'greek yogurt',
      'yoghurt',
      'yaourt',
      'yaourt grec',
      'gorgonzola',
      'mozzarella',
    ],
  },
  {
    category: SHOPPING_CATEGORIES.PRODUCE,
    names: [
      'tomato',
      'tomatoes',
      'tomate',
      'onion',
      'onions',
      'spinach',
      'avocado',
      'blueberry',
      'blueberries',
      'lemon',
      'basil',
      'lettuce',
      'cucumber',
      'plantain',
      'banana',
      'potato',
      'potatoes',
      'mango',
      'corn',
    ],
  },
  {
    category: SHOPPING_CATEGORIES.PASTA_GRAINS,
    names: [
      'pasta',
      'spaghetti',
      'tagliatelle',
      'fresh tagliatelle',
      'macaroni',
      'rice',
      'oats',
      'oat',
      'couscous',
    ],
  },
  {
    category: SHOPPING_CATEGORIES.PANTRY,
    names: [
      'flour',
      'sugar',
      'oil',
      'olive oil',
      'spice',
      'spices',
      'walnut',
      'walnuts',
      'chickpea',
      'chickpeas',
      'bean',
      'beans',
      'peanut butter',
      'chocolate',
      'honey',
      'canned food',
      'canned foods',
    ],
  },
  {
    category: SHOPPING_CATEGORIES.MEAT_PROTEIN,
    names: ['chicken', 'beef', 'fish', 'egg', 'eggs', 'tuna'],
  },
  {
    category: SHOPPING_CATEGORIES.BAKERY,
    names: ['bread', 'baguette', 'bun', 'buns', 'roll', 'rolls'],
  },
  {
    category: SHOPPING_CATEGORIES.FROZEN,
    names: ['frozen peas', 'ice cream', 'frozen vegetables', 'frozen berries'],
  },
  {
    category: SHOPPING_CATEGORIES.BEVERAGES,
    names: ['water', 'juice', 'tea', 'coffee', 'soda', 'wine'],
  },
];

const ALIAS_CATEGORY_MAP = new Map(
  CATEGORY_ALIASES.flatMap((group) =>
    group.names.map((name) => [normalizeIngredientName(name), group.category])
  )
);

const CANONICAL_NAME_ALIASES = new Map([
  ['tomatoes', 'tomato'],
  ['tomate', 'tomato'],
  ['greek yogurt', 'yogurt'],
  ['yoghurt', 'yogurt'],
  ['yaourt', 'yogurt'],
  ['yaourt grec', 'yogurt'],
  ['spaghetti', 'pasta'],
  ['tagliatelle', 'pasta'],
  ['fresh tagliatelle', 'pasta'],
  ['macaroni', 'pasta'],
  ['oat', 'oats'],
  ['blueberry', 'blueberries'],
  ['potato', 'potatoes'],
  ['egg', 'eggs'],
  ['walnut', 'walnuts'],
  ['bean', 'beans'],
  ['chickpea', 'chickpeas'],
]);

export function normalizeIngredientName(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeUnit(value = '') {
  return value.toString().trim().toLowerCase();
}

export function canonicalIngredientName(value = '') {
  const normalized = normalizeIngredientName(value);
  if (CANONICAL_NAME_ALIASES.has(normalized)) {
    return CANONICAL_NAME_ALIASES.get(normalized);
  }

  if (normalized.endsWith('ies') && normalized.length > 3) {
    return `${normalized.slice(0, -3)}y`;
  }

  if (normalized.endsWith('es') && normalized.length > 3) {
    return normalized.slice(0, -2);
  }

  if (normalized.endsWith('s') && !normalized.endsWith('ss') && normalized.length > 3) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

export function normalizeShoppingCategory(value) {
  if (!value) return null;
  const direct = value.toString().trim().toUpperCase();
  if (SHOPPING_CATEGORY_ORDER.includes(direct)) {
    return direct;
  }

  return LEGACY_CATEGORY_MAP.get(normalizeIngredientName(value)) || null;
}

export function suggestShoppingCategory(name, storedCategory) {
  const normalizedStored = normalizeShoppingCategory(storedCategory);
  if (normalizedStored) return normalizedStored;

  const normalized = normalizeIngredientName(name);
  const canonical = canonicalIngredientName(name);
  return ALIAS_CATEGORY_MAP.get(normalized) || ALIAS_CATEGORY_MAP.get(canonical) || SHOPPING_CATEGORIES.OTHER;
}

export function groceryItemKey({ name, unit }) {
  return `${canonicalIngredientName(name)}|${normalizeUnit(unit)}`;
}
