import express from 'express';
import { listIngredients } from '../controllers/ingredientController.js';

export const ingredientRoutes = express.Router();

ingredientRoutes.get('/', listIngredients);
