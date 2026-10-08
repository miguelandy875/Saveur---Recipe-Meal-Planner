import { describe, expect, it } from 'vitest';
import { GRAMS_PER_PIECE_BY_CODE, gramsPerPieceFor } from './gramsPerPiece.js';
import { toGrams } from '../services/nutritionCalculator.js';

describe('USDA grams per piece', () => {
  it('has the USDA medium-portion weights for the common ingredients', () => {
    expect(gramsPerPieceFor('ONION')).toBe(110);
    expect(gramsPerPieceFor('GREEN_PEPPER')).toBe(119);
    expect(gramsPerPieceFor('EGG_WHOLE')).toBe(44);
    expect(gramsPerPieceFor('CARROT')).toBe(61);
    expect(gramsPerPieceFor('UNKNOWN_THING')).toBeUndefined();
  });

  it('treats "pcs" of garlic as ONE CLOVE (3 g), not a head', () => {
    expect(gramsPerPieceFor('GARLIC')).toBe(3);
    expect(toGrams(4, 'pcs', gramsPerPieceFor('GARLIC')).grams).toBe(12);
  });

  it('only contains positive weights', () => {
    for (const grams of Object.values(GRAMS_PER_PIECE_BY_CODE)) expect(grams).toBeGreaterThan(0);
  });
});
