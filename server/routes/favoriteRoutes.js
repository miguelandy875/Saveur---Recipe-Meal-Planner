import express from 'express';
import { listFavorites, toggleFavorite } from '../controllers/favoriteController.js';
import { requireAuth } from '../middleware/auth.js';

export const favoriteRoutes = express.Router();

favoriteRoutes.get('/', requireAuth, listFavorites);
favoriteRoutes.post('/:recipeId/toggle', requireAuth, toggleFavorite);
