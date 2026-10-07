import mongoose from 'mongoose';

const recipeIngredientSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
    },
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
    optional: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const recipeStepSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true }
);

// Nutritional values computed from the legacy nutritional database (SOAP).
// `null` on recipes created before the feature: they must NOT look like "0 kcal".
const NUTRITION_SOURCE = 'legacy-nutritional-db';

const macroSchema = new mongoose.Schema(
  {
    calories: Number,
    proteins: Number,
    carbs: Number,
    fats: Number,
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    // complete: every ingredient counted; partial: some skipped (see skippedIngredients);
    // unavailable: the legacy service could not be reached/answered.
    status: { type: String, enum: ['complete', 'partial', 'unavailable'], required: true },
    totalCalories: Number,
    totalProteins: Number,
    totalCarbs: Number,
    totalFats: Number,
    perServing: { type: macroSchema, default: undefined },
    allergens: { type: [String], default: [] },
    skippedIngredients: {
      type: [new mongoose.Schema({ name: String, reason: String }, { _id: false })],
      default: [],
    },
    warnings: { type: [String], default: [] },
    unavailableReason: String,
    computedAt: Date,
    source: { type: String, default: NUTRITION_SOURCE },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
    prepTime: {
      type: Number,
      required: true,
      min: 0,
    },
    cookTime: {
      type: Number,
      required: true,
      min: 0,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    servings: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    cuisine: {
      type: String,
      trim: true,
      default: 'International',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    ingredients: [recipeIngredientSchema],
    steps: [recipeStepSchema],
    nutrition: { type: nutritionSchema, default: null },
  },
  { timestamps: true }
);

recipeSchema.index({ title: 'text', description: 'text' });

export { NUTRITION_SOURCE };

export const Recipe = mongoose.model('Recipe', recipeSchema);
