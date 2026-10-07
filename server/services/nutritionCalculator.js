// Pure nutrition computation: no I/O, no SOAP, no Mongoose. Easy to unit test.
//
// Assumptions (documented in the README):
//  - mass units are converted exactly; volume units use 1 ml = 1 g (water-like density);
//  - counted units (piece, unit, slice...) use the ingredient's `gramsPerUnit`, or DEFAULT_GRAMS_PER_UNIT
//    (flagged as an estimate) when the ingredient has none;
//  - an unknown unit means the ingredient is skipped and reported;
//  - optional ingredients are included in the totals;
//  - only the FINAL totals are rounded (to 1 decimal), never the intermediate values.

export const DEFAULT_GRAMS_PER_UNIT = 100;

const GRAMS_PER_MASS_UNIT = {
  mg: 0.001,
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  lb: 453.592,
  lbs: 453.592,
};

const ML_PER_VOLUME_UNIT = {
  ml: 1,
  cl: 10,
  dl: 100,
  l: 1000,
  liter: 1000,
  liters: 1000,
  litre: 1000,
  litres: 1000,
  tsp: 5,
  teaspoon: 5,
  tbsp: 15,
  tablespoon: 15,
  cup: 240,
  cups: 240,
};

const GRAMS_PER_SMALL_MEASURE = {
  pinch: 0.4,
  dash: 0.6,
};

const COUNTED_UNITS = new Set([
  'piece', 'pieces', 'pc', 'pcs', 'unit', 'units', 'slice', 'slices', 'whole', 'item', 'items',
  'clove', 'cloves', 'bunch',
]);

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Convert a quantity + unit to grams.
 * @returns {{ grams: number, estimated: boolean } | null} null when the unit is not supported.
 */
export function toGrams(quantity, unit, gramsPerUnit) {
  const amount = Number(quantity);
  const key = (unit || '').toString().trim().toLowerCase();
  if (!Number.isFinite(amount) || amount < 0) return null;

  if (key in GRAMS_PER_MASS_UNIT) return { grams: amount * GRAMS_PER_MASS_UNIT[key], estimated: false };
  if (key in ML_PER_VOLUME_UNIT) return { grams: amount * ML_PER_VOLUME_UNIT[key], estimated: false };
  if (key in GRAMS_PER_SMALL_MEASURE) return { grams: amount * GRAMS_PER_SMALL_MEASURE[key], estimated: true };

  if (COUNTED_UNITS.has(key)) {
    const known = Number(gramsPerUnit) > 0;
    return { grams: amount * (known ? Number(gramsPerUnit) : DEFAULT_GRAMS_PER_UNIT), estimated: !known };
  }

  return null;
}

/**
 * Compute recipe totals.
 * @param {Array<{name, quantity, unit, code, gramsPerUnit}>} entries recipe ingredients with their legacy code
 * @param {Map<string, object>} nutritionByCode clean per-100g values returned by the SOAP adapter
 * @param {number} servings
 */
export function computeRecipeNutrition(entries, nutritionByCode, servings) {
  const totals = { calories: 0, proteins: 0, carbs: 0, fats: 0 };
  const allergens = new Set();
  const skippedIngredients = [];
  const warnings = [];
  let counted = 0;

  for (const entry of entries) {
    if (!entry.code) {
      skippedIngredients.push({ name: entry.name, reason: 'No nutrition code for this ingredient.' });
      continue;
    }

    const data = nutritionByCode.get(entry.code);
    if (!data) {
      skippedIngredients.push({ name: entry.name, reason: `No data in the nutritional database for code ${entry.code}.` });
      continue;
    }

    const converted = toGrams(entry.quantity, entry.unit, entry.gramsPerUnit);
    if (!converted) {
      skippedIngredients.push({ name: entry.name, reason: `Unit "${entry.unit}" cannot be converted to grams.` });
      continue;
    }

    if (converted.estimated) {
      warnings.push(`${entry.name}: weight of "${entry.unit}" estimated (${DEFAULT_GRAMS_PER_UNIT} g/unit by default).`);
    }

    const factor = converted.grams / 100;
    totals.calories += data.caloriesPer100g * factor;
    totals.proteins += data.proteins * factor;
    totals.carbs += data.carbs * factor;
    totals.fats += data.fats * factor;
    data.allergens.forEach((allergen) => allergens.add(allergen));
    counted += 1;
  }

  const portions = Number(servings) > 0 ? Number(servings) : 1;

  return {
    status: skippedIngredients.length === 0 && counted > 0 ? 'complete' : 'partial',
    countedIngredients: counted,
    totalCalories: round1(totals.calories),
    totalProteins: round1(totals.proteins),
    totalCarbs: round1(totals.carbs),
    totalFats: round1(totals.fats),
    perServing: {
      calories: round1(totals.calories / portions),
      proteins: round1(totals.proteins / portions),
      carbs: round1(totals.carbs / portions),
      fats: round1(totals.fats / portions),
    },
    allergens: [...allergens].sort(),
    skippedIngredients,
    warnings,
  };
}
