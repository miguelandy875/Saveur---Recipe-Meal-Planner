import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase } from './config/db.js';
import { seedDemoData } from './data/seedData.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { categoryRoutes } from './routes/categoryRoutes.js';
import { dashboardRoutes } from './routes/dashboardRoutes.js';
import { favoriteRoutes } from './routes/favoriteRoutes.js';
import { groceryRoutes } from './routes/groceryRoutes.js';
import { ingredientRoutes } from './routes/ingredientRoutes.js';
import { mealPlanRoutes } from './routes/mealPlanRoutes.js';
import { recipeRoutes } from './routes/recipeRoutes.js';
import { uploadRoutes } from './routes/uploadRoutes.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Copy .env.example to .env and set a secret.');
}

await connectDatabase();

if (process.env.AUTO_SEED !== 'false') {
  await seedDemoData();
}

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'saveur-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/groceries', groceryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/uploads', uploadRoutes);

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(distPath, 'index.html'), (error) => {
    if (error) next();
  });
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Saveur API running on http://localhost:${port}`);
});
