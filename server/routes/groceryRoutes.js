import express from 'express';
import {
  addCustomGroceryItem,
  generateGroceryList,
  removeGroceryItem,
  updateGroceryItem,
} from '../controllers/groceryController.js';
import { requireAuth } from '../middleware/auth.js';

export const groceryRoutes = express.Router();

groceryRoutes.get('/', requireAuth, generateGroceryList);
groceryRoutes.post('/custom', requireAuth, addCustomGroceryItem);
groceryRoutes.patch('/:itemId', requireAuth, updateGroceryItem);
groceryRoutes.delete('/:itemId', requireAuth, removeGroceryItem);
