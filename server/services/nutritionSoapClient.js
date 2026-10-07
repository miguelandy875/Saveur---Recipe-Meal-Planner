// Thin SOAP adapter for the legacy nutritional database.
// Its ONLY jobs: call the SOAP operation and turn the XML-derived object into clean plain JSON.
// No business logic here (unit conversion, totals... live in nutritionCalculator.js / nutritionService.js).
import soap from 'soap';

const DEFAULT_TIMEOUT_MS = 5000;

/** The legacy service answered with a <soap:Fault> (e.g. unknown ingredient code). */
export class NutritionFaultError extends Error {
  constructor(message, { faultCode = '', unknownCodes = [], isClientFault = false } = {}) {
    super(message);
    this.name = 'NutritionFaultError';
    this.faultCode = faultCode;
    this.unknownCodes = unknownCodes;
    this.isClientFault = isClientFault;
  }
}

/** The legacy service could not be reached / its contract could not be loaded (down, timeout, bad URL...). */
export class NutritionUnavailableError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'NutritionUnavailableError';
    this.cause = cause;
  }
}

const toArray = (value) => {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
};

// node-soap returns an element that carries attributes (e.g. <faultstring xml:lang="en">) as { attributes, $value }.
const textOf = (value) => (value !== null && typeof value === 'object' ? String(value.$value ?? '') : String(value ?? ''));

/**
 * Raw node-soap result -> clean JSON. node-soap quirks handled here:
 *  - a list with ONE element is an object, not an array; an empty list is '' or missing;
 *  - decimals/longs can arrive as strings.
 */
export function normalizeResponse(raw) {
  return toArray(raw?.ingredient).map((item) => ({
    code: String(item.ingredientId),
    databaseId: Number(item.databaseId),
    name: String(item.name),
    caloriesPer100g: Number(item.caloriesPer100g),
    proteins: Number(item.proteins),
    carbs: Number(item.carbs),
    fats: Number(item.fats),
    allergens: toArray(item.allergens?.allergen).map(String),
  }));
}

/** node-soap error -> NutritionFaultError (<soap:Fault>) or NutritionUnavailableError (transport/WSDL). */
export function toNutritionError(error) {
  const fault = error?.root?.Envelope?.Body?.Fault;
  if (fault) {
    const faultCode = textOf(fault.faultcode ?? fault.Code?.Value);
    const faultString = textOf(fault.faultstring ?? fault.Reason?.Text) || 'SOAP fault';
    const unknownCodes = toArray(fault.detail?.getNutritionalValuesFault?.unknownCode).map(String);
    return new NutritionFaultError(faultString, {
      faultCode,
      unknownCodes,
      isClientFault: /client|sender/i.test(faultCode),
    });
  }

  const reason = error?.code || error?.cause?.code || error?.message || 'unknown error';
  return new NutritionUnavailableError(`Nutritional service unavailable (${reason}).`, error);
}

let clientPromise = null;

/**
 * The client (parsed WSDL) is cached as a PROMISE so concurrent requests share one load.
 * If the load fails (service down at startup...), the cache is cleared so the next call retries.
 */
function getClient() {
  if (!clientPromise) {
    const wsdlUrl = process.env.NUTRITION_WSDL_URL;
    if (!wsdlUrl) {
      return Promise.reject(new NutritionUnavailableError('NUTRITION_WSDL_URL is not configured.'));
    }

    const timeout = Number(process.env.NUTRITION_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
    clientPromise = soap.createClientAsync(wsdlUrl, { wsdl_options: { timeout } }).catch((error) => {
      clientPromise = null;
      throw error;
    });
  }
  return clientPromise;
}

export function resetNutritionClient() {
  clientPromise = null;
}

/**
 * ONE SOAP call for a list of ingredient codes.
 * @param {string[]} codes
 * @returns {Promise<Array<{code, databaseId, name, caloriesPer100g, proteins, carbs, fats, allergens: string[]}>>}
 * @throws {NutritionFaultError | NutritionUnavailableError}
 */
export async function getNutritionalValues(codes) {
  try {
    const client = await getClient();
    const timeout = Number(process.env.NUTRITION_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
    // The *Async method resolves to [result, rawResponse, soapHeader, rawRequest]
    const [result] = await client.getNutritionalValuesAsync({ ingredientCode: codes }, { timeout });
    return normalizeResponse(result);
  } catch (error) {
    throw toNutritionError(error);
  }
}
