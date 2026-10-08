import mongoose from 'mongoose';
import { SHOPPING_CATEGORY_ORDER, SHOPPING_CATEGORIES } from '../utils/shoppingCategories.js';

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    defaultUnit: {
      type: String,
      required: true,
      trim: true,
      default: 'unit',
    },
    category: {
      type: String,
      trim: true,
      enum: SHOPPING_CATEGORY_ORDER,
      default: SHOPPING_CATEGORIES.OTHER,
    },
    caloriesPerUnit: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Link with the legacy nutritional database (SOAP): e.g. "TOMATO", "FLOUR_WHEAT". Optional.
    nutritionCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    // Typical weight in grams of ONE counted unit (piece, slice, unit...). Used to convert "3 eggs" to grams.
    gramsPerUnit: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Ingredient = mongoose.model('Ingredient', ingredientSchema);
