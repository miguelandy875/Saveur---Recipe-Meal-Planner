// Mapping between Saveur ingredient names and the ingredient codes of the legacy nutritional database.
// The legacy codes are part of the SOAP contract (pattern [A-Z0-9_]+, see legacy-nutritional-db/.../nutrition.xsd).

// Names that do not simply map to "UPPERCASE_NAME" (singular/plural, precision added by the legacy base...).
const NAME_TO_NUTRITION_CODE = {
  eggs: 'EGG_WHOLE',
  egg: 'EGG_WHOLE',
  flour: 'FLOUR_WHEAT',
  milk: 'MILK_WHOLE',
  tomatoes: 'TOMATO',
  chicken: 'CHICKEN_BREAST',
  rice: 'RICE_WHITE',
  cream: 'CREAM_HEAVY',
  pasta: 'PASTA_DRY',
  walnuts: 'WALNUT',
  bread: 'BREAD_WHEAT',
  cheese: 'CHEESE_CHEDDAR',
  yogurt: 'YOGURT_PLAIN',
  blueberries: 'BLUEBERRY',
  chocolate: 'CHOCOLATE_MILK',
  potatoes: 'POTATO',
  tuna: 'TUNA_CANNED',
};

/**
 * Suggest the legacy code for an ingredient name: explicit mapping first, otherwise a derived
 * uppercase code ("Olive oil" -> "OLIVE_OIL"). The derived code may not exist in the legacy base:
 * the nutrition service then skips that ingredient (it is reported, never fatal).
 */
export function suggestNutritionCode(name) {
  const clean = (name || '').toString().trim().toLowerCase();
  if (!clean) return '';

  if (NAME_TO_NUTRITION_CODE[clean]) {
    return NAME_TO_NUTRITION_CODE[clean];
  }

  return clean
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .slice(0, 50);
}
