import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Other',
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const shoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekStart: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    items: [shoppingItemSchema],
  },
  { timestamps: true }
);

shoppingListSchema.index({ user: 1, weekStart: 1 }, { unique: true });

export const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);
