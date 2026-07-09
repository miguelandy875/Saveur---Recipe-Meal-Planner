import bcrypt from 'bcryptjs';
import { Category } from '../models/Category.js';
import { Ingredient } from '../models/Ingredient.js';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';

const categorySeeds = [
  {
    name: 'Petit dejeuner',
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=700&fit=crop',
  },
  {
    name: 'Plat principal',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&fit=crop',
  },
  {
    name: 'Dessert',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=700&fit=crop',
  },
  {
    name: 'Salade',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&fit=crop',
  },
  {
    name: 'Aperitif',
    image: 'https://images.unsplash.com/photo-1541535881962-3bb380b08458?w=700&fit=crop',
  },
];

const ingredientSeeds = [
  { name: 'Oeufs', defaultUnit: 'piece', category: 'Protein' },
  { name: 'Farine', defaultUnit: 'g', category: 'Pantry' },
  { name: 'Tomates', defaultUnit: 'g', category: 'Produce' },
  { name: 'Poulet', defaultUnit: 'g', category: 'Protein' },
  { name: 'Riz', defaultUnit: 'g', category: 'Pantry' },
  { name: 'Citron', defaultUnit: 'piece', category: 'Produce' },
  { name: 'Creme', defaultUnit: 'ml', category: 'Dairy' },
  { name: 'Pates', defaultUnit: 'g', category: 'Pantry' },
  { name: 'Noix', defaultUnit: 'g', category: 'Pantry' },
  { name: 'Gorgonzola', defaultUnit: 'g', category: 'Dairy' },
  { name: 'Sucre', defaultUnit: 'g', category: 'Pantry' },
  { name: 'Beurre', defaultUnit: 'g', category: 'Dairy' },
];

function byName(items) {
  return items.reduce((map, item) => {
    map[item.name] = item;
    return map;
  }, {});
}

function recipeIngredient(ingredients, name, quantity, unit, optional = false) {
  return {
    ingredient: ingredients[name]._id,
    name,
    quantity,
    unit,
    optional,
  };
}

export async function seedDemoData() {
  const existingRecipes = await Recipe.countDocuments();
  if (existingRecipes > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash('saveur123', 12);
  const adminHash = await bcrypt.hash('admin12345', 12);

  const [chef, admin] = await Promise.all([
    User.findOneAndUpdate(
      { email: 'chef@saveur.local' },
      { name: 'Demo Chef', email: 'chef@saveur.local', passwordHash, role: 'user' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ),
    User.findOneAndUpdate(
      { email: 'admin@saveur.local' },
      { name: 'Saveur Admin', email: 'admin@saveur.local', passwordHash: adminHash, role: 'admin' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ),
  ]);

  const categories = byName(
    await Promise.all(
      categorySeeds.map((category) =>
        Category.findOneAndUpdate({ name: category.name }, category, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        })
      )
    )
  );

  const ingredients = byName(
    await Promise.all(
      ingredientSeeds.map((ingredient) =>
        Ingredient.findOneAndUpdate({ name: ingredient.name }, ingredient, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        })
      )
    )
  );

  await Recipe.insertMany([
    {
      title: 'Tagliatelles au Gorgonzola',
      description: 'Une recette cremeuse avec noix croquantes, rapide pour le diner.',
      prepTime: 10,
      cookTime: 12,
      difficulty: 2,
      servings: 2,
      category: categories['Plat principal']._id,
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=900&fit=crop',
      isPublic: true,
      ingredients: [
        recipeIngredient(ingredients, 'Pates', 250, 'g'),
        recipeIngredient(ingredients, 'Gorgonzola', 150, 'g'),
        recipeIngredient(ingredients, 'Creme', 100, 'ml'),
        recipeIngredient(ingredients, 'Noix', 50, 'g'),
      ],
      steps: [
        { order: 1, title: 'Cuire', description: 'Cuire les pates dans une grande casserole d eau salee.' },
        { order: 2, title: 'Sauce', description: 'Faire fondre le gorgonzola avec la creme a feu doux.' },
        { order: 3, title: 'Assembler', description: 'Melanger les pates avec la sauce et ajouter les noix.' },
      ],
    },
    {
      title: 'Poulet au Citron et Riz',
      description: 'Plat complet, simple a planifier et facile a ajouter a la liste de courses.',
      prepTime: 15,
      cookTime: 35,
      difficulty: 3,
      servings: 4,
      category: categories['Plat principal']._id,
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=900&fit=crop',
      isPublic: true,
      ingredients: [
        recipeIngredient(ingredients, 'Poulet', 600, 'g'),
        recipeIngredient(ingredients, 'Riz', 300, 'g'),
        recipeIngredient(ingredients, 'Citron', 2, 'piece'),
        recipeIngredient(ingredients, 'Tomates', 200, 'g', true),
      ],
      steps: [
        { order: 1, title: 'Mariner', description: 'Assaisonner le poulet avec citron, sel et herbes.' },
        { order: 2, title: 'Cuire', description: 'Cuire le poulet au four puis preparer le riz separement.' },
        { order: 3, title: 'Servir', description: 'Servir avec tomates fraiches si disponibles.' },
      ],
    },
    {
      title: 'Crepes Maison',
      description: 'Petit dejeuner familial avec ingredients simples et quantites faciles a ajuster.',
      prepTime: 10,
      cookTime: 20,
      difficulty: 1,
      servings: 4,
      category: categories['Petit dejeuner']._id,
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=900&fit=crop',
      isPublic: true,
      ingredients: [
        recipeIngredient(ingredients, 'Farine', 250, 'g'),
        recipeIngredient(ingredients, 'Oeufs', 3, 'piece'),
        recipeIngredient(ingredients, 'Beurre', 30, 'g'),
        recipeIngredient(ingredients, 'Sucre', 25, 'g', true),
      ],
      steps: [
        { order: 1, title: 'Pate', description: 'Melanger farine, oeufs, lait et beurre fondu.' },
        { order: 2, title: 'Repos', description: 'Laisser reposer la pate pendant 15 minutes.' },
        { order: 3, title: 'Cuisson', description: 'Cuire chaque crepe dans une poele chaude legerement beurree.' },
      ],
    },
  ]);

  console.log('Demo data seeded. Login with chef@saveur.local / saveur123.');
}
