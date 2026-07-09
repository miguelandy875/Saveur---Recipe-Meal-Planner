import { MealPlanEntry, MealType } from '../types';
import { apiFetch } from './api';

interface ListResponse<T> {
  data: T[];
}

interface ItemResponse<T> {
  data: T;
}

export const getMealPlanForDate = async (_userId: string, date: string) => {
  try {
    const response = await apiFetch<ListResponse<MealPlanEntry>>(`/meal-plans?date=${encodeURIComponent(date)}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getMealPlanForRange = async (start: string, end: string) => {
  try {
    const response = await apiFetch<ListResponse<MealPlanEntry>>(
      `/meal-plans?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addToMealPlan = async (_userId: string, date: string, recipeId: string, mealType: string) => {
  try {
    const response = await apiFetch<ItemResponse<MealPlanEntry>>('/meal-plans', {
      method: 'POST',
      body: JSON.stringify({ date, recipeId, mealType: mealType as MealType }),
    });
    return response.data.id;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const removeFromMealPlan = async (entryId: string) => {
  try {
    await apiFetch<void>(`/meal-plans/${entryId}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
