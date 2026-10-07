// Orchestrates the nutrition computation of a recipe: resolves legacy codes, calls the SOAP adapter ONCE,
// delegates the maths to nutritionCalculator.js and returns a plain object ready to be stored in Mongo.
// It NEVER throws: a failing legacy service must not prevent a recipe from being saved.
import { Ingredient } from '../models/Ingredient.js';
import { NUTRITION_SOURCE } from '../models/Recipe.js';
import { suggestNutritionCode } from '../utils/nutritionCodes.js';
import { computeRecipeNutrition } from './nutritionCalculator.js';
import { NutritionFaultError, getNutritionalValues } from './nutritionSoapClient.js';

function unavailable(reason) {
  return { status: 'unavailable', unavailableReason: reason, source: NUTRITION_SOURCE };
}

/**
 * @param {Array<{name, quantity, unit, code?, gramsPerUnit?}>} entries
 * @param {number} servings
 * @param {{ fetchNutrition?: Function, logger?: Pick<Console,'warn'> }} deps injectable for tests
 */
export async function buildNutrition(entries, servings, { fetchNutrition = getNutritionalValues, logger = console } = {}) {
  const warnings = [];
  let codes = [...new Set(entries.map((entry) => entry.code).filter(Boolean))];

  if (codes.length === 0) {
    return unavailable('No ingredient has a nutrition code.');
  }

  let found;
  try {
    try {
      found = await fetchNutrition(codes);
    } catch (error) {
      // Business error: <soap:Fault> "Unknown ingredient code". The legacy service is all-or-nothing, so
      // we drop the unknown codes and retry ONCE; those ingredients are skipped and reported.
      if (error instanceof NutritionFaultError && error.isClientFault && error.unknownCodes.length > 0) {
        const unknown = new Set(error.unknownCodes);
        warnings.push(`Unknown to the nutritional database: ${[...unknown].join(', ')}.`);
        logger.warn(`[nutrition] ${error.message} - retrying without them.`);
        codes = codes.filter((code) => !unknown.has(code));
        found = codes.length > 0 ? await fetchNutrition(codes) : [];
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.warn(`[nutrition] Nutrition unavailable: ${error.message}`);
    return unavailable(error.message);
  }

  const nutritionByCode = new Map(found.map((item) => [item.code, item]));
  const result = computeRecipeNutrition(entries, nutritionByCode, servings);

  if (result.countedIngredients === 0) {
    return unavailable('No ingredient could be resolved in the nutritional database.');
  }

  const { countedIngredients: _counted, ...nutrition } = result;
  return {
    ...nutrition,
    warnings: [...warnings, ...nutrition.warnings],
    computedAt: new Date(),
    source: NUTRITION_SOURCE,
  };
}

/**
 * Compute the nutrition of normalized recipe ingredients ({ ingredient: ObjectId, name, quantity, unit }).
 * Loads the Ingredient documents (reuse of the existing model) to get nutritionCode / gramsPerUnit.
 */
export async function computeRecipeNutritionFor(recipeIngredients, servings, deps) {
  try {
    const ids = recipeIngredients.map((item) => item.ingredient).filter(Boolean);
    const docs = await Ingredient.find({ _id: { $in: ids } }).select('name nutritionCode gramsPerUnit');
    const byId = new Map(docs.map((doc) => [doc._id.toString(), doc]));

    const entries = recipeIngredients.map((item) => {
      const doc = byId.get(item.ingredient?.toString());
      return {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        code: doc?.nutritionCode || suggestNutritionCode(item.name),
        gramsPerUnit: doc?.gramsPerUnit,
      };
    });

    return await buildNutrition(entries, servings, deps);
  } catch (error) {
    (deps?.logger || console).warn(`[nutrition] Unexpected error: ${error.message}`);
    return unavailable(error.message);
  }
}
