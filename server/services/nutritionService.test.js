import { describe, expect, it, vi } from 'vitest';
import { buildNutrition } from './nutritionService.js';
import { NutritionFaultError, NutritionUnavailableError } from './nutritionSoapClient.js';

const flour = { code: 'FLOUR_WHEAT', caloriesPer100g: 364, proteins: 10.3, carbs: 76.3, fats: 1, allergens: ['GLUTEN'] };
const logger = { warn: vi.fn() };
const entries = [
  { name: 'Flour', quantity: 100, unit: 'g', code: 'FLOUR_WHEAT' },
  { name: 'Saffron', quantity: 1, unit: 'g', code: 'SAFFRON' },
  { name: 'Flour again', quantity: 100, unit: 'g', code: 'FLOUR_WHEAT' },
];

describe('buildNutrition', () => {
  it('sends every distinct code in ONE call', async () => {
    const fetchNutrition = vi.fn().mockResolvedValue([flour]);
    await buildNutrition([entries[0], entries[2]], 2, { fetchNutrition, logger });
    expect(fetchNutrition).toHaveBeenCalledTimes(1);
    expect(fetchNutrition).toHaveBeenCalledWith(['FLOUR_WHEAT']);
  });

  it('on a <soap:Fault> for unknown codes: retries without them and saves partial nutrition + warning', async () => {
    const fault = new NutritionFaultError('Unknown ingredient code: SAFFRON', { isClientFault: true, unknownCodes: ['SAFFRON'] });
    const fetchNutrition = vi.fn().mockRejectedValueOnce(fault).mockResolvedValueOnce([flour]);

    const nutrition = await buildNutrition(entries, 1, { fetchNutrition, logger });

    expect(fetchNutrition).toHaveBeenNthCalledWith(2, ['FLOUR_WHEAT']);
    expect(nutrition.status).toBe('partial');
    expect(nutrition.totalCalories).toBe(728);
    expect(nutrition.skippedIngredients.map((item) => item.name)).toEqual(['Saffron']);
    expect(nutrition.warnings[0]).toContain('SAFFRON');
    expect(nutrition.source).toBe('legacy-nutritional-db');
  });

  it('treats a client fault WITHOUT unknown codes (e.g. XSD validation error) as unavailable, with no retry', async () => {
    const fault = new NutritionFaultError('Validation error', { isClientFault: true, unknownCodes: [] });
    const fetchNutrition = vi.fn().mockRejectedValue(fault);

    const nutrition = await buildNutrition(entries, 1, { fetchNutrition, logger });

    expect(nutrition).toMatchObject({ status: 'unavailable', unavailableReason: 'Validation error' });
    expect(fetchNutrition).toHaveBeenCalledTimes(1);
  });

  it('marks nutrition unavailable (no throw) when the service is down', async () => {
    const fetchNutrition = vi.fn().mockRejectedValue(new NutritionUnavailableError('Nutritional service unavailable (ECONNREFUSED).'));
    logger.warn.mockClear();

    const nutrition = await buildNutrition(entries, 1, { fetchNutrition, logger });

    expect(nutrition).toMatchObject({ status: 'unavailable', unavailableReason: expect.stringContaining('ECONNREFUSED') });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('is unavailable when no ingredient has a code', async () => {
    const fetchNutrition = vi.fn();
    const nutrition = await buildNutrition([{ name: 'X', quantity: 1, unit: 'g', code: '' }], 1, { fetchNutrition, logger });
    expect(nutrition.status).toBe('unavailable');
    expect(fetchNutrition).not.toHaveBeenCalled();
  });
});
