import dotenv from 'dotenv';
import { connectDatabase } from '../config/db.js';
import { Ingredient } from '../models/Ingredient.js';
import { ShoppingList } from '../models/ShoppingList.js';
import { suggestShoppingCategory } from '../utils/shoppingCategories.js';

dotenv.config();

await connectDatabase();

let ingredientUpdates = 0;
let shoppingListUpdates = 0;

const ingredients = await Ingredient.find();
for (const ingredient of ingredients) {
  const category = suggestShoppingCategory(ingredient.name, ingredient.category);
  if (ingredient.category !== category) {
    ingredient.category = category;
    await ingredient.save();
    ingredientUpdates += 1;
  }
}

const shoppingLists = await ShoppingList.find();
for (const list of shoppingLists) {
  let changed = false;

  for (const item of list.items) {
    const category = suggestShoppingCategory(item.name, item.category);
    if (item.category !== category) {
      item.category = category;
      changed = true;
    }

    if (!item.source) {
      item.source = 'generated';
      changed = true;
    }
  }

  if (changed) {
    await list.save();
    shoppingListUpdates += 1;
  }
}

console.log(
  `Shopping category migration complete. Ingredients updated: ${ingredientUpdates}. Shopping lists updated: ${shoppingListUpdates}.`
);
process.exit(0);
