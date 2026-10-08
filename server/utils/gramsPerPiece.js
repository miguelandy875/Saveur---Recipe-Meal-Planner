// Typical weight (g) of ONE counted unit ("pcs", "piece", "slice", "clove"...), by legacy nutrition code.
// Source: USDA FoodData Central, SR Legacy (2018-04), "medium" household portion when one exists,
// otherwise the single-item portion (label in the comment). The weight comes from the same USDA food
// as the per-100 g values wherever the legacy row is FDC-sourced (see README "Grams per piece").
//
// Lookup order in nutritionService: Ingredient.gramsPerUnit (curated per ingredient) > this table >
// DEFAULT_GRAMS_PER_UNIT (100 g, flagged as an estimate).
export const GRAMS_PER_PIECE_BY_CODE = {
  ONION: 110, // FDC 170000: medium (2-1/2" dia)
  GREEN_PEPPER: 119, // FDC 170427: medium (approx 2-3/4" long, 2-1/2" dia)
  BELL_PEPPER: 119, // FDC 170108: medium (approx 2-3/4" long, 2-1/2 dia.)
  GARLIC: 3, // FDC 169230: clove  -> "pcs" of garlic = ONE CLOVE, not a head
  CARROT: 61, // FDC 170393: medium
  MANGO: 336, // FDC 169910: fruit without refuse (no "medium" portion)
  PLANTAIN: 270, // FDC 169130: plantain (no "medium" portion)
  CORN: 102, // FDC 169998: ear, medium (6-3/4" to 7-1/2" long) yields
  EGG_WHOLE: 44, // FDC 171287: medium
  TOMATO: 123, // FDC 170457: medium whole (2-3/5" dia)
  POTATO: 213, // FDC 170026: Potato medium (2-1/4" to 3-1/4" dia)
  LEMON: 58, // FDC 167746: fruit (2-1/8" dia) (no "medium" portion)
  BANANA: 118, // FDC 173944: medium (7" to 7-7/8" long)
  AVOCADO: 201, // FDC 171705: avocado, NS as to Florida or California (no "medium" portion)
  CUCUMBER: 301, // FDC 168409: cucumber (8-1/4") (no "medium" portion)
  BREAD_WHEAT: 32, // FDC 172688: slice (whole-wheat bread)
};

export function gramsPerPieceFor(code) {
  return GRAMS_PER_PIECE_BY_CODE[code];
}
