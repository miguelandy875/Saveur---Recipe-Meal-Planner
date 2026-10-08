// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { NutritionCard } from './NutritionCard';
import { I18nProvider } from '../services/i18n';
import { RecipeNutrition } from '../types';

const base: RecipeNutrition = {
  status: 'complete',
  totalCalories: 1614.1,
  totalProteins: 59.3,
  totalCarbs: 213.4,
  totalFats: 55.9,
  approximate: false,
  perServing: { calories: 403.5, proteins: 14.8, carbs: 53.4, fats: 14 },
  allergens: ['EGGS', 'GLUTEN', 'LACTOSE'],
  skippedIngredients: [],
  warnings: [],
  unavailableReason: null,
  computedAt: '2026-10-07T17:36:05.701Z',
  source: 'legacy-nutritional-db',
};

const renderCard = (nutrition?: RecipeNutrition | null) =>
  render(
    <I18nProvider>
      <NutritionCard nutrition={nutrition} />
    </I18nProvider>
  );

afterEach(cleanup);

describe('NutritionCard', () => {
  it('shows per-serving and total values plus one badge per allergen', () => {
    renderCard(base);
    expect(screen.getByText('403.5 kcal')).toBeInTheDocument();
    expect(screen.getByText('1614.1 kcal')).toBeInTheDocument();
    expect(screen.getAllByTestId('allergen-badge').map((badge) => badge.textContent)).toEqual(['Eggs', 'Gluten', 'Lactose']);
  });

  it('shows exact values without "≈" when every quantity was given in g/ml', () => {
    renderCard(base);
    expect(screen.queryByText(/≈/)).toBeNull();
    expect(screen.queryByTestId('nutrition-approximate-note')).toBeNull();
  });

  it('marks totals and per-serving values with "≈" plus a note when some quantities were converted', () => {
    renderCard({ ...base, approximate: true });
    expect(screen.getByText('≈ 403.5 kcal')).toBeInTheDocument();
    expect(screen.getByText('≈ 1614.1 kcal')).toBeInTheDocument();
    expect(screen.getByTestId('nutrition-approximate-note')).toHaveTextContent(/Approximate values/);
  });

  it('flags partial values', () => {
    renderCard({ ...base, status: 'partial', skippedIngredients: [{ name: 'Saffron', reason: 'x' }] });
    expect(screen.getByText(/1 ingredient/)).toBeInTheDocument();
  });

  it('shows an unavailable message instead of zeros', () => {
    renderCard({ ...base, status: 'unavailable', totalCalories: null, perServing: null, allergens: [] });
    expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
    expect(screen.queryByText(/kcal/)).toBeNull();
  });

  it('renders nothing for recipes created before the feature (nutrition = null)', () => {
    renderCard(null);
    expect(screen.queryByTestId('nutrition-card')).toBeNull();
  });
});
