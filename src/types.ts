export type LanguageCode = 'en' | 'fr' | 'es' | 'it';

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  photoURL?: string;
  preferredLanguage?: LanguageCode;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  category?: string;
  caloriesPerUnit?: number;
}

export interface RecipeIngredient {
  id?: string;
  ingredientId?: string;
  name: string;
  quantity: number;
  unit: string;
  optional: boolean;
  category?: string;
}

export interface RecipeStep {
  id?: string;
  order: number;
  title?: string;
  description: string;
}

export interface NutritionMacros {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export type NutritionStatus = 'complete' | 'partial' | 'unavailable';

/** Nutritional values computed from the legacy nutritional database (SOAP). `null` = never computed. */
export interface RecipeNutrition {
  status: NutritionStatus;
  totalCalories: number | null;
  totalProteins: number | null;
  totalCarbs: number | null;
  totalFats: number | null;
  perServing: NutritionMacros | null;
  allergens: string[];
  skippedIngredients: { name: string; reason: string }[];
  warnings: string[];
  unavailableReason: string | null;
  computedAt: string | null;
  source: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: number;
  servings: number;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  cuisine?: string;
  userId: string;
  userName?: string;
  imageUrl?: string;
  isPublic: boolean;
  isFavorite?: boolean;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  nutrition?: RecipeNutrition | null;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ShoppingCategory =
  | 'DAIRY'
  | 'PRODUCE'
  | 'PASTA_GRAINS'
  | 'PANTRY'
  | 'MEAT_PROTEIN'
  | 'BAKERY'
  | 'FROZEN'
  | 'BEVERAGES'
  | 'OTHER';

export interface MealPlanEntry {
  id: string;
  userId: string;
  date: string;
  recipeId: string;
  mealType: MealType;
  recipe?: Recipe | null;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  checked: boolean;
  source?: 'generated' | 'custom';
}

export interface DashboardStats {
  recipes: number;
  favorites: number;
  plannedMeals: number;
  groceryItems: number;
}
