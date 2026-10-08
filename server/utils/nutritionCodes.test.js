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

  it('derives the codes of the common ingredients added to the legacy base', () => {
    for (const [name, code] of [['Onion', 'ONION'], ['green pepper', 'GREEN_PEPPER'], ['Garlic', 'GARLIC'], ['Carrot', 'CARROT'], ['Salt', 'SALT'], ['Beef', 'BEEF'], ['Mango', 'MANGO']]) {
      expect(suggestNutritionCode(name)).toBe(code);
    }
  });

  it('maps plural/synonym forms onto the same legacy code', () => {
    expect(suggestNutritionCode('Onions')).toBe('ONION');
    expect(suggestNutritionCode('Ground beef')).toBe('BEEF');
    expect(suggestNutritionCode('Red bell pepper')).toBe('BELL_PEPPER');
    expect(suggestNutritionCode('Green bell pepper')).toBe('GREEN_PEPPER');
    expect(suggestNutritionCode('garlic cloves')).toBe('GARLIC');
  });

  it('keeps unknown ingredients unknown (fault demo): Saffron derives SAFFRON, not a seeded code', () => {
    expect(suggestNutritionCode('Saffron')).toBe('SAFFRON');
  });
});
