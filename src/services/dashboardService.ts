import { DashboardStats } from '../types';
import { apiFetch } from './api';

export const getDashboardStats = async () => {
  try {
    const response = await apiFetch<{ data: DashboardStats }>('/dashboard');
    return response.data;
  } catch (error) {
    console.error(error);
    return {
      recipes: 0,
      favorites: 0,
      plannedMeals: 0,
      groceryItems: 0,
    };
  }
};
