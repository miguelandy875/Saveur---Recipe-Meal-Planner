import { GroceryItem } from '../types';
import { apiFetch } from './api';

export const getSmartGroceryList = async (weekStart: string) => {
  try {
    const response = await apiFetch<{ data: GroceryItem[] }>(
      `/groceries?weekStart=${encodeURIComponent(weekStart)}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
