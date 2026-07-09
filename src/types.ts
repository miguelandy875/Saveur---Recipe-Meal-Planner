export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  photoURL?: string;
}

export interface Category {
  id: string;
  name: string;
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
  userId: string;
  userName?: string;
  imageUrl?: string;
  isPublic: boolean;
  isFavorite?: boolean;
  ingredients?: RecipeIngredient[];
  steps?: RecipeStep[];
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
  category: string;
  checked: boolean;
}

export interface DashboardStats {
  recipes: number;
  favorites: number;
  plannedMeals: number;
  groceryItems: number;
}
