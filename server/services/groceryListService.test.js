import { describe, expect, it } from 'vitest';
import { buildGeneratedGroceryItems, mergeCustomItem } from './groceryListService.js';
import { suggestShoppingCategory } from '../utils/shoppingCategories.js';

describe('shopping category resolution', () => {
  it('recognizes aliases safely across case, plurals and multilingual names', () => {
    expect(suggestShoppingCategory('Greek yogurt')).toBe('DAIRY');
    expect(suggestShoppingCategory('yaourt grec')).toBe('DAIRY');
    expect(suggestShoppingCategory('Tomatoes')).toBe('PRODUCE');
    expect(suggestShoppingCategory('tagliatelle')).toBe('PASTA_GRAINS');
    expect(suggestShoppingCategory('mystery packet')).toBe('OTHER');
  });
});

describe('grocery list generation', () => {
  it('aggregates compatible quantities under one stable shopping category', () => {
    const entries = [
      {
        recipe: {
          ingredients: [{ ingredient: 'butter-id', name: 'Butter', quantity: 200, unit: 'g' }],
        },
      },
      {
        recipe: {
          ingredients: [{ ingredient: 'butter-id', name: 'butter', quantity: 100, unit: 'g' }],
        },
      },
    ];
    const ingredientLookup = new Map([['butter-id', { category: 'DAIRY', defaultUnit: 'g' }]]);

    const items = buildGeneratedGroceryItems(entries, ingredientLookup);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: 'Butter',
      quantity: 300,
      unit: 'g',
      category: 'DAIRY',
    });
  });

  it('preserves checked state when the generated list is refreshed', () => {
    const entries = [
      {
        recipe: {
          ingredients: [{ ingredient: 'egg-id', name: 'Eggs', quantity: 3, unit: 'piece' }],
        },
      },
    ];
    const previousItems = [{ name: 'eggs', quantity: 3, unit: 'piece', checked: true, source: 'generated' }];
    const ingredientLookup = new Map([['egg-id', { category: 'MEAT_PROTEIN', defaultUnit: 'piece' }]]);

    const items = buildGeneratedGroceryItems(entries, ingredientLookup, previousItems);

    expect(items[0].checked).toBe(true);
    expect(items[0].category).toBe('MEAT_PROTEIN');
  });

  it('keeps a manually selected custom category when adding a custom item', () => {
    const items = [];

    mergeCustomItem(items, {
      name: 'Birthday candles',
      quantity: 1,
      unit: 'pack',
      category: 'OTHER',
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: 'Birthday candles',
      quantity: 1,
      unit: 'pack',
      category: 'OTHER',
      source: 'custom',
    });
  });
});
