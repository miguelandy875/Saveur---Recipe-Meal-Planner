export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  caloriesPerUnit?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  difficulty: number; // 1-5
  servings: number;
  categoryId: string;
  userId: string;
  imageUrl?: string;
  isPublic: boolean;
  createdAt: any;
}

export interface RecipeStep {
  id: string;
  order: number;
  description: string;
  imageUrl?: string;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  quantity: number;
  optional: boolean;
}

export interface MealPlan {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  recipeId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface UserFavorite {
  id: string;
  userId: string;
  recipeId: string;
  addedAt: any;
}
