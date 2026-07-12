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

export const addCustomGroceryItem = async (item: {
  weekStart: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}) => {
  const response = await apiFetch<{ data: GroceryItem[] }>('/groceries/custom', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return response.data;
};

export const updateGroceryItemChecked = async (itemId: string, weekStart: string, checked: boolean) => {
  const response = await apiFetch<{ data: GroceryItem }>(`/groceries/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ weekStart, checked }),
  });
  return response.data;
};

export const removeGroceryItem = async (itemId: string, weekStart: string) => {
  const response = await apiFetch<{ data: GroceryItem[] }>(
    `/groceries/${itemId}?weekStart=${encodeURIComponent(weekStart)}`,
    { method: 'DELETE' }
  );
  return response.data;
};
