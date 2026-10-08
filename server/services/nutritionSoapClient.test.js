import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('soap', () => ({ default: { createClientAsync: vi.fn() } }));

import soap from 'soap';
import {
  NutritionFaultError,
  NutritionUnavailableError,
  getNutritionalValues,
  normalizeResponse,
  resetNutritionClient,
  toNutritionError,
} from './nutritionSoapClient.js';

describe('normalizeResponse (XML-derived object -> clean JSON)', () => {
  it('converts decimals/longs to numbers and always returns allergens arrays', () => {
    const items = normalizeResponse({
      ingredient: [
        { databaseId: '2', ingredientId: 'FLOUR_WHEAT', name: 'Wheat flour', caloriesPer100g: '364.00', proteins: '10.30', carbs: '76.30', fats: '1.00', allergens: { allergen: 'GLUTEN' } },
        { databaseId: '6', ingredientId: 'TOMATO', name: 'Tomato', caloriesPer100g: '18.00', proteins: '0.90', carbs: '3.90', fats: '0.20', allergens: '' },
        { databaseId: '24', ingredientId: 'CHOCOLATE_MILK', name: 'Milk chocolate', caloriesPer100g: '535.00', proteins: '7.70', carbs: '59.40', fats: '29.70', allergens: { allergen: ['LACTOSE', 'SOY'] } },
      ],
    });

    expect(items[0]).toEqual({
      code: 'FLOUR_WHEAT', databaseId: 2, name: 'Wheat flour', caloriesPer100g: 364, proteins: 10.3, carbs: 76.3, fats: 1, allergens: ['GLUTEN'],
    });
    expect(items[1].allergens).toEqual([]);
    expect(items[2].allergens).toEqual(['LACTOSE', 'SOY']);
  });

  it('handles a single ingredient (object instead of array) and an empty answer', () => {
    const one = normalizeResponse({ ingredient: { databaseId: 1, ingredientId: 'BUTTER', name: 'Butter', caloriesPer100g: 717, proteins: 0.9, carbs: 0.1, fats: 81.1 } });
    expect(one).toHaveLength(1);
    expect(one[0].allergens).toEqual([]);
    expect(normalizeResponse(undefined)).toEqual([]);
  });
});

describe('toNutritionError', () => {
  it('turns a <soap:Fault> into a NutritionFaultError carrying the unknown codes', () => {
    const error = toNutritionError({
      root: { Envelope: { Body: { Fault: {
        faultcode: 'SOAP-ENV:Client',
        faultstring: 'Unknown ingredient codes: XYZ, ABC',
        detail: { getNutritionalValuesFault: { unknownCode: ['XYZ', 'ABC'] } },
      } } } },
    });

    expect(error).toBeInstanceOf(NutritionFaultError);
    expect(error.isClientFault).toBe(true);
    expect(error.unknownCodes).toEqual(['XYZ', 'ABC']);
    expect(error.message).toBe('Unknown ingredient codes: XYZ, ABC');
  });

  it('reads a faultstring carrying an xml:lang attribute (real node-soap shape)', () => {
    const error = toNutritionError({ root: { Envelope: { Body: { Fault: {
      faultcode: 'SOAP-ENV:Client',
      faultstring: { attributes: { 'xml:lang': 'en' }, $value: 'Unknown ingredient code: XYZ' },
      detail: { getNutritionalValuesFault: { unknownCode: 'XYZ' } },
    } } } } });
    expect(error.message).toBe('Unknown ingredient code: XYZ');
  });

  it('accepts a single unknown code (object instead of array)', () => {
    const error = toNutritionError({ root: { Envelope: { Body: { Fault: {
      faultcode: 'SOAP-ENV:Client', faultstring: 'Unknown ingredient code: XYZ',
      detail: { getNutritionalValuesFault: { unknownCode: 'XYZ' } },
    } } } } });
    expect(error.unknownCodes).toEqual(['XYZ']);
  });

  it('turns transport errors into NutritionUnavailableError', () => {
    const error = toNutritionError(Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }));
    expect(error).toBeInstanceOf(NutritionUnavailableError);
    expect(error.message).toContain('ECONNREFUSED');
  });
});

describe('getNutritionalValues client cache', () => {
  beforeEach(() => {
    resetNutritionClient();
    soap.createClientAsync.mockReset();
    process.env.NUTRITION_WSDL_URL = 'http://localhost:8080/ws/mon-service.wsdl';
  });

  it('retries creating the client after a failed load, then caches it', async () => {
    const getNutritionalValuesAsync = vi.fn().mockResolvedValue([{ ingredient: { databaseId: 1, ingredientId: 'BUTTER', name: 'Butter', caloriesPer100g: 717, proteins: 0.9, carbs: 0.1, fats: 81.1, allergens: { allergen: 'LACTOSE' } } }]);
    soap.createClientAsync
      .mockRejectedValueOnce(Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }))
      .mockResolvedValue({ getNutritionalValuesAsync });

    await expect(getNutritionalValues(['BUTTER'])).rejects.toBeInstanceOf(NutritionUnavailableError);

    const result = await getNutritionalValues(['BUTTER']);
    expect(result[0]).toMatchObject({ code: 'BUTTER', caloriesPer100g: 717, allergens: ['LACTOSE'] });

    await getNutritionalValues(['BUTTER']);
    expect(soap.createClientAsync).toHaveBeenCalledTimes(2); // 1 failure + 1 success, then cached
    expect(getNutritionalValuesAsync).toHaveBeenCalledWith({ ingredientCode: ['BUTTER'] }, expect.objectContaining({ timeout: expect.any(Number) }));
  });

  it('is unavailable (not a crash) when NUTRITION_WSDL_URL is missing', async () => {
    delete process.env.NUTRITION_WSDL_URL;
    await expect(getNutritionalValues(['BUTTER'])).rejects.toBeInstanceOf(NutritionUnavailableError);
  });
});
