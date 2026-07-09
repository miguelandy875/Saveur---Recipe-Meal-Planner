import express from 'express';
import { generateGroceryList } from '../controllers/groceryController.js';
import { requireAuth } from '../middleware/auth.js';

export const groceryRoutes = express.Router();

groceryRoutes.get('/', requireAuth, generateGroceryList);
