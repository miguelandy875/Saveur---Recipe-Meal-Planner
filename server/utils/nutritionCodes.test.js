import { describe, expect, it } from 'vitest';
import { suggestNutritionCode } from './nutritionCodes.js';

describe('suggestNutritionCode', () => {
  it('uses the explicit mapping for known Saveur names', () => {
    expect(suggestNutritionCode('Tomatoes')).toBe('TOMATO');
    expect(suggestNutritionCode(' flour ')).toBe('FLOUR_WHEAT');
    expect(suggestNutritionCode('Eggs')).toBe('EGG_WHOLE');
  });

  it('derives an uppercase code otherwise (matches the XSD pattern [A-Z0-9_]+)', () => {
    expect(suggestNutritionCode('Olive oil')).toBe('OLIVE_OIL');
    expect(suggestNutritionCode('Crème fraîche')).toBe('CREME_FRAICHE');
    expect(suggestNutritionCode('Saffron')).toMatch(/^[A-Z0-9_]+$/);
    expect(suggestNutritionCode('')).toBe('');
  });
});
