import mongoose from 'mongoose';

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
      default: 'Other',
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
