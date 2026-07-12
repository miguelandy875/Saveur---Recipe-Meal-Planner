import React from 'react';
import { Apple, Coffee, Dessert, Pizza, Salad, UtensilsCrossed, Zap } from 'lucide-react';

export function getCategoryIcon(name: string, size = 24) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('breakfast') || normalizedName.includes('petit')) {
    return <Coffee size={size} />;
  }

  if (normalizedName.includes('main') || normalizedName.includes('plat') || normalizedName.includes('dinner')) {
    return <UtensilsCrossed size={size} />;
  }

  if (normalizedName.includes('dessert') || normalizedName.includes('sweet')) {
    return <Dessert size={size} />;
  }

  if (normalizedName.includes('salad') || normalizedName.includes('salade')) {
    return <Salad size={size} />;
  }

  if (normalizedName.includes('snack') || normalizedName.includes('gouter')) {
    return <Apple size={size} />;
  }

  if (
    normalizedName.includes('appetizer') ||
    normalizedName.includes('aperitif') ||
    normalizedName.includes('starter') ||
    normalizedName.includes('pizza') ||
    normalizedName.includes('fast')
  ) {
    return <Pizza size={size} />;
  }

  return <Zap size={size} />;
}
