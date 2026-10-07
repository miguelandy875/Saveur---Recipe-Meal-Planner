import express from 'express';
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  listUserRecipes,
  refreshRecipeNutrition,
  updateRecipe,
} from '../controllers/recipeController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

export const recipeRoutes = express.Router();

recipeRoutes.get('/', optionalAuth, listRecipes);
recipeRoutes.get('/mine', requireAuth, listUserRecipes);
recipeRoutes.post('/', requireAuth, createRecipe);
recipeRoutes.get('/:id', optionalAuth, getRecipe);
recipeRoutes.put('/:id', requireAuth, updateRecipe);
recipeRoutes.post('/:id/nutrition/refresh', requireAuth, refreshRecipeNutrition);
recipeRoutes.delete('/:id', requireAuth, deleteRecipe);
