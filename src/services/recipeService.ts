import { Category, Ingredient, Recipe, RecipeIngredient, RecipeStep } from '../types';
import { apiFetch } from './api';

interface ListResponse<T> {
  data: T[];
}

interface ItemResponse<T> {
  data: T;
}

interface UploadResponse {
  url: string;
}

export const getFeaturedRecipes = async (limitCount = 5) => {
  try {
    const response = await apiFetch<ListResponse<Recipe>>('/recipes');
    return response.data.slice(0, limitCount);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const response = await apiFetch<ListResponse<Category>>('/categories');
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getIngredients = async (search = '') => {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiFetch<ListResponse<Ingredient>>(`/ingredients${query}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getRecipeById = async (id: string) => {
  try {
    const response = await apiFetch<ItemResponse<Recipe>>(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getFilteredRecipes = async (filters: {
  categoryId?: string;
  difficulty?: number;
  maxTime?: number;
  search?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.difficulty) params.set('difficulty', String(filters.difficulty));
    if (filters.maxTime) params.set('maxTime', String(filters.maxTime));
    if (filters.search) params.set('search', filters.search);

    const query = params.toString() ? `?${params}` : '';
    const response = await apiFetch<ListResponse<Recipe>>(`/recipes${query}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createRecipe = async (
  recipeData: Omit<Recipe, 'id' | 'createdAt' | 'ingredients' | 'steps' | 'isFavorite'>,
  steps: Omit<RecipeStep, 'id'>[],
  ingredients: Omit<RecipeIngredient, 'id'>[]
) => {
  try {
    const response = await apiFetch<ItemResponse<Recipe>>('/recipes', {
      method: 'POST',
      body: JSON.stringify({
        ...recipeData,
        steps,
        ingredients,
      }),
    });

    return response.data.id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateRecipe = async (
  recipeId: string,
  recipeData: Omit<Recipe, 'id' | 'createdAt' | 'ingredients' | 'steps' | 'isFavorite'>,
  steps: Omit<RecipeStep, 'id'>[],
  ingredients: Omit<RecipeIngredient, 'id'>[]
) => {
  try {
    const response = await apiFetch<ItemResponse<Recipe>>(`/recipes/${recipeId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...recipeData,
        steps,
        ingredients,
      }),
    });

    return response.data.id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const uploadRecipeImage = async (file: File) => {
  const body = new FormData();
  body.append('photo', file);

  const response = await apiFetch<UploadResponse>('/uploads/recipe-image', {
    method: 'POST',
    body,
  });

  return response.url;
};

export const deleteRecipe = async (recipeId: string) => {
  await apiFetch<void>(`/recipes/${recipeId}`, {
    method: 'DELETE',
  });
};

export const getUserRecipes = async (_userId?: string) => {
  try {
    const response = await apiFetch<ListResponse<Recipe>>('/recipes/mine');
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getFavoriteRecipes = async () => {
  try {
    const response = await apiFetch<ListResponse<Recipe>>('/favorites');
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const toggleFavorite = async (_userId: string, recipeId: string) => {
  const response = await apiFetch<{ isFavorite: boolean }>(`/favorites/${recipeId}/toggle`, {
    method: 'POST',
  });
  return response.isFavorite;
};
