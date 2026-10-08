import { describe, expect, it } from 'vitest';
import { DEFAULT_GRAMS_PER_UNIT, computeRecipeNutrition, toGrams } from './nutritionCalculator.js';

describe('toGrams (unit conversion)', () => {
  it('converts mass units exactly', () => {
    expect(toGrams(250, 'g')).toEqual({ grams: 250, estimated: false, approximate: false });
    expect(toGrams(1.5, 'kg')).toEqual({ grams: 1500, estimated: false, approximate: false });
    expect(toGrams(2, 'OZ').grams).toBeCloseTo(56.699, 3);
  });

  it('converts volumes assuming 1 ml = 1 g', () => {
    expect(toGrams(450, 'ml').grams).toBe(450);
    expect(toGrams(1, 'l').grams).toBe(1000);
    expect(toGrams(2, 'tbsp').grams).toBe(30);
    expect(toGrams(1, 'tsp').grams).toBe(5);
    expect(toGrams(1, 'cup').grams).toBe(240);
  });

  it('uses the ingredient weight for counted units', () => {
    expect(toGrams(3, 'piece', 50)).toEqual({ grams: 150, estimated: false, approximate: true });
    expect(toGrams(4, 'slice', 30)).toEqual({ grams: 120, estimated: false, approximate: true });
  });

  it('falls back to a flagged estimate when a counted unit has no known weight', () => {
    expect(toGrams(2, 'unit')).toEqual({ grams: 2 * DEFAULT_GRAMS_PER_UNIT, estimated: true, approximate: true });
  });

  it('flags approximate conversions: counted units, spoons/cups, pinch/dash and default weights; g/ml stay exact', () => {
    expect(toGrams(100, 'g').approximate).toBe(false);
    expect(toGrams(1, 'kg').approximate).toBe(false);
    expect(toGrams(450, 'ml').approximate).toBe(false);
    expect(toGrams(1, 'l').approximate).toBe(false);
    expect(toGrams(1, 'pcs', 110).approximate).toBe(true);
    expect(toGrams(1, 'tbsp').approximate).toBe(true);
    expect(toGrams(1, 'tsp').approximate).toBe(true);
    expect(toGrams(1, 'cup').approximate).toBe(true);
    expect(toGrams(1, 'pinch').approximate).toBe(true);
    expect(toGrams(2, 'unit').approximate).toBe(true);
  });

  it('treats "pcs" like a counted unit', () => {
    expect(toGrams(3, 'pcs', 44)).toEqual({ grams: 132, estimated: false, approximate: true });
  });

  it('returns null for unsupported units or invalid quantities', () => {
    expect(toGrams(1, 'bucket')).toBeNull();
    expect(toGrams('abc', 'g')).toBeNull();
    expect(toGrams(-1, 'g')).toBeNull();
  });
});

describe('computeRecipeNutrition', () => {
  const nutritionByCode = new Map([
    ['FLOUR_WHEAT', { code: 'FLOUR_WHEAT', caloriesPer100g: 364, proteins: 10.3, carbs: 76.3, fats: 1, allergens: ['GLUTEN'] }],
    ['EGG_WHOLE', { code: 'EGG_WHOLE', caloriesPer100g: 143, proteins: 12.6, carbs: 0.7, fats: 9.5, allergens: ['EGGS'] }],
  ]);

  it('sums per-100g values scaled by grams, per serving, with unique sorted allergens', () => {
    const result = computeRecipeNutrition(
      [
        { name: 'Flour', quantity: 250, unit: 'g', code: 'FLOUR_WHEAT' },
        { name: 'Eggs', quantity: 3, unit: 'piece', code: 'EGG_WHOLE', gramsPerUnit: 50 },
      ],
      nutritionByCode,
      4
    );

    // 250 g flour = 910 kcal, 150 g eggs = 214.5 kcal
    expect(result.status).toBe('complete');
    expect(result.totalCalories).toBe(1124.5);
    expect(result.totalProteins).toBe(44.7); // 25.75 + 18.9 = 44.65 -> 44.7
    expect(result.perServing.calories).toBe(281.1); // 1124.5 / 4 = 281.125
    expect(result.allergens).toEqual(['EGGS', 'GLUTEN']);
    expect(result.skippedIngredients).toEqual([]);
  });

  it('skips and reports ingredients without code, without data, or with an unsupported unit', () => {
    const result = computeRecipeNutrition(
      [
        { name: 'Flour', quantity: 100, unit: 'g', code: 'FLOUR_WHEAT' },
        { name: 'Mystery', quantity: 1, unit: 'g', code: '' },
        { name: 'Saffron', quantity: 1, unit: 'g', code: 'SAFFRON' },
        { name: 'Eggs', quantity: 1, unit: 'bucket', code: 'EGG_WHOLE' },
      ],
      nutritionByCode,
      1
    );

    expect(result.status).toBe('partial');
    expect(result.countedIngredients).toBe(1);
    expect(result.skippedIngredients.map((item) => item.name)).toEqual(['Mystery', 'Saffron', 'Eggs']);
    expect(result.totalCalories).toBe(364);
  });

  it('warns when a counted unit weight is only an estimate', () => {
    const result = computeRecipeNutrition([{ name: 'Eggs', quantity: 2, unit: 'piece', code: 'EGG_WHOLE' }], nutritionByCode, 1);
    expect(result.warnings).toHaveLength(1);
    expect(result.totalCalories).toBe(286); // 200 g * 1.43
  });

  it('is NOT approximate when every quantity is an exact mass/ml, and IS when one comes from pcs', () => {
    const exact = computeRecipeNutrition([{ name: 'Flour', quantity: 250, unit: 'g', code: 'FLOUR_WHEAT' }], nutritionByCode, 1);
    expect(exact.approximate).toBe(false);

    const mixed = computeRecipeNutrition(
      [
        { name: 'Flour', quantity: 250, unit: 'g', code: 'FLOUR_WHEAT' },
        { name: 'Egg', quantity: 3, unit: 'pcs', code: 'EGG_WHOLE', gramsPerUnit: 44 },
      ],
      nutritionByCode,
      1
    );
    expect(mixed.approximate).toBe(true);
    expect(mixed.status).toBe('complete'); // approximate is independent from status
  });

  it('computes an omelette with onion and green pepper from USDA values (hand-checked)', () => {
    const usda = new Map([
      ['EGG_WHOLE', { code: 'EGG_WHOLE', caloriesPer100g: 143, proteins: 12.6, carbs: 0.7, fats: 9.5, allergens: ['EGGS'] }],
      ['ONION', { code: 'ONION', caloriesPer100g: 40, proteins: 1.1, carbs: 9.34, fats: 0.1, allergens: [] }],
      ['GREEN_PEPPER', { code: 'GREEN_PEPPER', caloriesPer100g: 20, proteins: 0.86, carbs: 4.64, fats: 0.17, allergens: [] }],
    ]);
    const result = computeRecipeNutrition(
      [
        { name: 'Egg', quantity: 3, unit: 'pcs', code: 'EGG_WHOLE', gramsPerUnit: 44 },
        { name: 'Onion', quantity: 1, unit: 'pcs', code: 'ONION', gramsPerUnit: 110 },
        { name: 'green pepper', quantity: 1, unit: 'pcs', code: 'GREEN_PEPPER', gramsPerUnit: 119 },
      ],
      usda,
      4
    );

    // 132 g egg x 1.43 = 188.76 ; 110 g onion x 0.40 = 44 ; 119 g pepper x 0.20 = 23.8  => 256.56 -> 256.6
    expect(result.totalCalories).toBe(256.6);
    expect(result.status).toBe('complete');
    expect(result.approximate).toBe(true);
    expect(result.perServing.calories).toBe(64.1); // 256.56 / 4 = 64.14
  });
});
