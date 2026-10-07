import { describe, expect, it } from 'vitest';
import { DEFAULT_GRAMS_PER_UNIT, computeRecipeNutrition, toGrams } from './nutritionCalculator.js';

describe('toGrams (unit conversion)', () => {
  it('converts mass units exactly', () => {
    expect(toGrams(250, 'g')).toEqual({ grams: 250, estimated: false });
    expect(toGrams(1.5, 'kg')).toEqual({ grams: 1500, estimated: false });
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
    expect(toGrams(3, 'piece', 50)).toEqual({ grams: 150, estimated: false });
    expect(toGrams(4, 'slice', 30)).toEqual({ grams: 120, estimated: false });
  });

  it('falls back to a flagged estimate when a counted unit has no known weight', () => {
    expect(toGrams(2, 'unit')).toEqual({ grams: 2 * DEFAULT_GRAMS_PER_UNIT, estimated: true });
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
});
