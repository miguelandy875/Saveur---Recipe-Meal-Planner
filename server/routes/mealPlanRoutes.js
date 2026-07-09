import express from 'express';
import { getMealPlan, removeMealPlan, upsertMealPlan } from '../controllers/mealPlanController.js';
import { requireAuth } from '../middleware/auth.js';

export const mealPlanRoutes = express.Router();

mealPlanRoutes.get('/', requireAuth, getMealPlan);
mealPlanRoutes.post('/', requireAuth, upsertMealPlan);
mealPlanRoutes.delete('/:id', requireAuth, removeMealPlan);
