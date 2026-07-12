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
  },
  { timestamps: true }
);

export const Ingredient = mongoose.model('Ingredient', ingredientSchema);
