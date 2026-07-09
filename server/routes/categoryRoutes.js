import express from 'express';
import { listCategories } from '../controllers/categoryController.js';

export const categoryRoutes = express.Router();

categoryRoutes.get('/', listCategories);
