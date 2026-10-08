import bcrypt from 'bcryptjs';
import { Category } from '../models/Category.js';
import { Ingredient } from '../models/Ingredient.js';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';
import { gramsPerPieceFor } from '../utils/gramsPerPiece.js';
import { suggestNutritionCode } from '../utils/nutritionCodes.js';
import { SHOPPING_CATEGORIES } from '../utils/shoppingCategories.js';

const categorySeeds = [
  {
    slug: 'breakfast',
    name: 'Breakfast',
    legacyNames: ['Petit dejeuner'],
    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=900&fit=crop',
  },
  {
    slug: 'main-dishes',
    name: 'Main Dishes',
    legacyNames: ['Plat principal'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&fit=crop',
  },
  {
    slug: 'desserts',
    name: 'Desserts',
    legacyNames: ['Dessert'],
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=900&fit=crop',
  },
  {
    slug: 'salads',
    name: 'Salads',
    legacyNames: ['Salade'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&fit=crop',
  },
  {
    slug: 'appetizers',
    name: 'Appetizers',
    legacyNames: ['Aperitif'],
    image: 'https://images.unsplash.com/photo-1541535881962-3bb380b08458?w=900&fit=crop',
  },
  {
    slug: 'snacks',
    name: 'Snacks',
    legacyNames: ['Snack', 'Gouter'],
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=900&fit=crop',
  },
];

const ingredientSeeds = [
  { name: 'Eggs', defaultUnit: 'piece', category: SHOPPING_CATEGORIES.MEAT_PROTEIN },
  { name: 'Flour', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Milk', defaultUnit: 'ml', category: SHOPPING_CATEGORIES.DAIRY },
  { name: 'Butter', defaultUnit: 'g', category: SHOPPING_CATEGORIES.DAIRY },
  { name: 'Sugar', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Tomatoes', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Chicken', defaultUnit: 'g', category: SHOPPING_CATEGORIES.MEAT_PROTEIN },
  { name: 'Rice', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PASTA_GRAINS },
  { name: 'Lemon', defaultUnit: 'piece', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Cream', defaultUnit: 'ml', category: SHOPPING_CATEGORIES.DAIRY },
  { name: 'Pasta', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PASTA_GRAINS },
  { name: 'Walnuts', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Gorgonzola', defaultUnit: 'g', category: SHOPPING_CATEGORIES.DAIRY },
  { name: 'Olive oil', defaultUnit: 'ml', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Mozzarella', defaultUnit: 'g', category: SHOPPING_CATEGORIES.DAIRY },
  { name: 'Basil', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Avocado', defaultUnit: 'piece', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Lettuce', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Cucumber', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Chickpeas', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Plantain', defaultUnit: 'piece', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Beans', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Peanut butter', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Banana', defaultUnit: 'piece', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Chocolate', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Yogurt', defaultUnit: 'g', category: SHOPPING_CATEGORIES.DAIRY },
  { name: 'Honey', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PANTRY },
  { name: 'Bread', defaultUnit: 'slice', category: SHOPPING_CATEGORIES.BAKERY },
  { name: 'Cheese', defaultUnit: 'g', category: SHOPPING_CATEGORIES.DAIRY },
  { name: 'Potatoes', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Tuna', defaultUnit: 'g', category: SHOPPING_CATEGORIES.MEAT_PROTEIN },
  { name: 'Corn', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Mango', defaultUnit: 'piece', category: SHOPPING_CATEGORIES.PRODUCE },
  { name: 'Oats', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PASTA_GRAINS },
  { name: 'Blueberries', defaultUnit: 'g', category: SHOPPING_CATEGORIES.PRODUCE },
];

function byName(items) {
  return items.reduce((map, item) => {
    map[item.name] = item;
    return map;
  }, {});
}

async function ensureCategory(seed) {
  const category = await Category.findOne({
    $or: [
      { slug: seed.slug },
      { name: seed.name },
      ...seed.legacyNames.map((name) => ({ name })),
    ],
  });

  if (category) {
    category.name = seed.name;
    category.slug = seed.slug;
    category.image = seed.image;
    await category.save();
    return category;
  }

  return Category.create({
    name: seed.name,
    slug: seed.slug,
    image: seed.image,
  });
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

function recipeStep(order, title, description) {
  return { order, title, description };
}

function recipeSeeds(categories, ingredients, chef, admin) {
  const c = categories;
  const i = ingredients;

  return [
    {
      title: 'Crepes Maison',
      description: 'Soft French crepes for a family breakfast with simple pantry ingredients.',
      prepTime: 10,
      cookTime: 20,
      difficulty: 1,
      servings: 4,
      category: c.Breakfast._id,
      cuisine: 'French',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Flour', 250, 'g'),
        recipeIngredient(i, 'Eggs', 3, 'piece'),
        recipeIngredient(i, 'Milk', 450, 'ml'),
        recipeIngredient(i, 'Butter', 30, 'g'),
      ],
      steps: [
        recipeStep(1, 'Mix', 'Whisk flour, eggs and milk until the batter is smooth.'),
        recipeStep(2, 'Rest', 'Let the batter rest for 15 minutes.'),
        recipeStep(3, 'Cook', 'Cook thin crepes in a lightly buttered pan until golden.'),
      ],
    },
    {
      title: 'Banana Oat Bowl',
      description: 'A quick breakfast bowl with oats, banana, yogurt and honey.',
      prepTime: 8,
      cookTime: 5,
      difficulty: 1,
      servings: 2,
      category: c.Breakfast._id,
      cuisine: 'International',
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Oats', 120, 'g'),
        recipeIngredient(i, 'Banana', 2, 'piece'),
        recipeIngredient(i, 'Yogurt', 200, 'g'),
        recipeIngredient(i, 'Honey', 20, 'g', true),
      ],
      steps: [
        recipeStep(1, 'Cook oats', 'Simmer oats with milk until creamy.'),
        recipeStep(2, 'Slice fruit', 'Slice the bananas and prepare the yogurt.'),
        recipeStep(3, 'Serve', 'Top oats with yogurt, banana and honey.'),
      ],
    },
    {
      title: 'Avocado Toast',
      description: 'Crisp toast with avocado, lemon and a soft egg.',
      prepTime: 10,
      cookTime: 6,
      difficulty: 1,
      servings: 2,
      category: c.Breakfast._id,
      cuisine: 'International',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Bread', 4, 'slice'),
        recipeIngredient(i, 'Avocado', 2, 'piece'),
        recipeIngredient(i, 'Eggs', 2, 'piece'),
        recipeIngredient(i, 'Lemon', 1, 'piece'),
      ],
      steps: [
        recipeStep(1, 'Toast', 'Toast bread until crisp.'),
        recipeStep(2, 'Mash', 'Mash avocado with lemon juice and a pinch of salt.'),
        recipeStep(3, 'Finish', 'Top with egg and serve warm.'),
      ],
    },
    {
      title: 'Tagliatelles au Gorgonzola',
      description: 'Creamy Italian pasta with walnuts and gorgonzola for an elegant dinner.',
      prepTime: 10,
      cookTime: 12,
      difficulty: 2,
      servings: 2,
      category: c['Main Dishes']._id,
      cuisine: 'Italian',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Pasta', 250, 'g'),
        recipeIngredient(i, 'Gorgonzola', 150, 'g'),
        recipeIngredient(i, 'Cream', 100, 'ml'),
        recipeIngredient(i, 'Walnuts', 50, 'g'),
      ],
      steps: [
        recipeStep(1, 'Prepare walnuts', 'Toast walnuts in a dry pan until fragrant.'),
        recipeStep(2, 'Create sauce', 'Melt gorgonzola into cream over low heat.'),
        recipeStep(3, 'Combine', 'Toss pasta with sauce, walnuts and a splash of pasta water.'),
      ],
    },
    {
      title: 'Poulet au Citron et Riz',
      description: 'Lemon chicken with rice, easy to plan for a weeknight meal.',
      prepTime: 15,
      cookTime: 35,
      difficulty: 3,
      servings: 4,
      category: c['Main Dishes']._id,
      cuisine: 'French',
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Chicken', 600, 'g'),
        recipeIngredient(i, 'Rice', 300, 'g'),
        recipeIngredient(i, 'Lemon', 2, 'piece'),
        recipeIngredient(i, 'Tomatoes', 200, 'g', true),
      ],
      steps: [
        recipeStep(1, 'Marinate', 'Season chicken with lemon, salt and herbs.'),
        recipeStep(2, 'Bake', 'Bake chicken until cooked through and juicy.'),
        recipeStep(3, 'Serve', 'Serve with rice and fresh tomatoes.'),
      ],
    },
    {
      title: 'Burundian Beans And Plantain',
      description: 'Comforting beans served with plantain for a hearty East African plate.',
      prepTime: 15,
      cookTime: 40,
      difficulty: 3,
      servings: 4,
      category: c['Main Dishes']._id,
      cuisine: 'Burundian/East African',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Beans', 400, 'g'),
        recipeIngredient(i, 'Plantain', 3, 'piece'),
        recipeIngredient(i, 'Tomatoes', 250, 'g'),
        recipeIngredient(i, 'Olive oil', 25, 'ml'),
      ],
      steps: [
        recipeStep(1, 'Cook beans', 'Simmer beans until tender with salt and aromatics.'),
        recipeStep(2, 'Make sauce', 'Cook tomatoes with oil until reduced.'),
        recipeStep(3, 'Serve', 'Serve beans with fried or boiled plantain.'),
      ],
    },
    {
      title: 'Lemon Meringue Tart',
      description: 'A bright tart with lemon cream and toasted meringue.',
      prepTime: 25,
      cookTime: 30,
      difficulty: 4,
      servings: 8,
      category: c.Desserts._id,
      cuisine: 'French',
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Flour', 200, 'g'),
        recipeIngredient(i, 'Butter', 120, 'g'),
        recipeIngredient(i, 'Lemon', 3, 'piece'),
        recipeIngredient(i, 'Sugar', 180, 'g'),
      ],
      steps: [
        recipeStep(1, 'Bake crust', 'Bake the pastry shell until lightly golden.'),
        recipeStep(2, 'Fill', 'Cook lemon filling until thick and glossy.'),
        recipeStep(3, 'Toast', 'Top with meringue and toast until browned.'),
      ],
    },
    {
      title: 'Chocolate Banana Cake',
      description: 'Moist banana cake with melted chocolate pieces.',
      prepTime: 18,
      cookTime: 35,
      difficulty: 2,
      servings: 8,
      category: c.Desserts._id,
      cuisine: 'International',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Banana', 3, 'piece'),
        recipeIngredient(i, 'Flour', 220, 'g'),
        recipeIngredient(i, 'Chocolate', 120, 'g'),
        recipeIngredient(i, 'Eggs', 2, 'piece'),
      ],
      steps: [
        recipeStep(1, 'Mash', 'Mash bananas and mix with eggs.'),
        recipeStep(2, 'Fold', 'Fold in flour and chopped chocolate.'),
        recipeStep(3, 'Bake', 'Bake until a skewer comes out clean.'),
      ],
    },
    {
      title: 'Greek Yogurt Parfait',
      description: 'Layered yogurt, honey and blueberries for a light dessert.',
      prepTime: 10,
      cookTime: 0,
      difficulty: 1,
      servings: 2,
      category: c.Desserts._id,
      cuisine: 'Mediterranean',
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Yogurt', 300, 'g'),
        recipeIngredient(i, 'Blueberries', 125, 'g'),
        recipeIngredient(i, 'Honey', 30, 'g'),
        recipeIngredient(i, 'Walnuts', 30, 'g', true),
      ],
      steps: [
        recipeStep(1, 'Layer yogurt', 'Add yogurt to small glasses.'),
        recipeStep(2, 'Add fruit', 'Layer blueberries over the yogurt.'),
        recipeStep(3, 'Finish', 'Drizzle honey and add walnuts if desired.'),
      ],
    },
    {
      title: 'Mediterranean Chickpea Salad',
      description: 'Fresh chickpeas with cucumber, tomato, lemon and olive oil.',
      prepTime: 15,
      cookTime: 0,
      difficulty: 1,
      servings: 4,
      category: c.Salads._id,
      cuisine: 'Mediterranean',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Chickpeas', 300, 'g'),
        recipeIngredient(i, 'Cucumber', 200, 'g'),
        recipeIngredient(i, 'Tomatoes', 250, 'g'),
        recipeIngredient(i, 'Lemon', 1, 'piece'),
      ],
      steps: [
        recipeStep(1, 'Chop', 'Chop cucumber and tomatoes into small pieces.'),
        recipeStep(2, 'Mix', 'Combine vegetables with chickpeas.'),
        recipeStep(3, 'Dress', 'Dress with lemon juice and olive oil.'),
      ],
    },
    {
      title: 'Chicken Avocado Salad',
      description: 'A filling salad with chicken, avocado and crisp lettuce.',
      prepTime: 15,
      cookTime: 15,
      difficulty: 2,
      servings: 2,
      category: c.Salads._id,
      cuisine: 'International',
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Chicken', 250, 'g'),
        recipeIngredient(i, 'Avocado', 1, 'piece'),
        recipeIngredient(i, 'Lettuce', 120, 'g'),
        recipeIngredient(i, 'Tomatoes', 120, 'g'),
      ],
      steps: [
        recipeStep(1, 'Cook chicken', 'Grill chicken until golden and cooked through.'),
        recipeStep(2, 'Prepare vegetables', 'Slice avocado, lettuce and tomatoes.'),
        recipeStep(3, 'Assemble', 'Arrange salad and top with warm chicken.'),
      ],
    },
    {
      title: 'Spanish Tuna Potato Salad',
      description: 'A Spanish-inspired potato salad with tuna, corn and olive oil.',
      prepTime: 15,
      cookTime: 20,
      difficulty: 2,
      servings: 4,
      category: c.Salads._id,
      cuisine: 'Spanish',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Potatoes', 500, 'g'),
        recipeIngredient(i, 'Tuna', 160, 'g'),
        recipeIngredient(i, 'Corn', 120, 'g'),
        recipeIngredient(i, 'Olive oil', 25, 'ml'),
      ],
      steps: [
        recipeStep(1, 'Boil', 'Boil potatoes until tender, then cool and dice.'),
        recipeStep(2, 'Combine', 'Mix potatoes with tuna and corn.'),
        recipeStep(3, 'Season', 'Dress with olive oil, salt and lemon.'),
      ],
    },
    {
      title: 'Caprese Skewers',
      description: 'Mini mozzarella, tomato and basil skewers for easy entertaining.',
      prepTime: 12,
      cookTime: 0,
      difficulty: 1,
      servings: 6,
      category: c.Appetizers._id,
      cuisine: 'Italian',
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1592417817038-d13fd7342605?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Mozzarella', 200, 'g'),
        recipeIngredient(i, 'Tomatoes', 250, 'g'),
        recipeIngredient(i, 'Basil', 20, 'g'),
        recipeIngredient(i, 'Olive oil', 20, 'ml'),
      ],
      steps: [
        recipeStep(1, 'Prepare', 'Drain mozzarella and wash tomatoes.'),
        recipeStep(2, 'Skewer', 'Thread tomato, basil and mozzarella onto skewers.'),
        recipeStep(3, 'Dress', 'Drizzle with olive oil before serving.'),
      ],
    },
    {
      title: 'Spanish Tomato Bread',
      description: 'Toasted bread rubbed with tomato, olive oil and salt.',
      prepTime: 10,
      cookTime: 5,
      difficulty: 1,
      servings: 4,
      category: c.Appetizers._id,
      cuisine: 'Spanish',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Bread', 8, 'slice'),
        recipeIngredient(i, 'Tomatoes', 300, 'g'),
        recipeIngredient(i, 'Olive oil', 30, 'ml'),
        recipeIngredient(i, 'Lemon', 1, 'piece', true),
      ],
      steps: [
        recipeStep(1, 'Toast', 'Toast bread slices until crisp.'),
        recipeStep(2, 'Rub', 'Rub tomato over each slice.'),
        recipeStep(3, 'Finish', 'Add olive oil and a little salt.'),
      ],
    },
    {
      title: 'Peanut Plantain Bites',
      description: 'Small plantain bites with a savory peanut sauce.',
      prepTime: 12,
      cookTime: 15,
      difficulty: 2,
      servings: 4,
      category: c.Appetizers._id,
      cuisine: 'Burundian/East African',
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Plantain', 3, 'piece'),
        recipeIngredient(i, 'Peanut butter', 80, 'g'),
        recipeIngredient(i, 'Tomatoes', 100, 'g'),
        recipeIngredient(i, 'Olive oil', 20, 'ml'),
      ],
      steps: [
        recipeStep(1, 'Cook plantain', 'Slice and cook plantain until tender.'),
        recipeStep(2, 'Sauce', 'Warm peanut butter with tomato and a little water.'),
        recipeStep(3, 'Serve', 'Spoon sauce over plantain bites.'),
      ],
    },
    {
      title: 'Mango Yogurt Cups',
      description: 'Fresh mango with yogurt and honey for a quick snack.',
      prepTime: 8,
      cookTime: 0,
      difficulty: 1,
      servings: 2,
      category: c.Snacks._id,
      cuisine: 'International',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Mango', 2, 'piece'),
        recipeIngredient(i, 'Yogurt', 200, 'g'),
        recipeIngredient(i, 'Honey', 20, 'g'),
        recipeIngredient(i, 'Blueberries', 50, 'g', true),
      ],
      steps: [
        recipeStep(1, 'Dice', 'Dice mango into bite-size cubes.'),
        recipeStep(2, 'Layer', 'Layer mango and yogurt in cups.'),
        recipeStep(3, 'Finish', 'Drizzle honey on top.'),
      ],
    },
    {
      title: 'Cheese Toast Fingers',
      description: 'Warm cheese toast cut into snackable fingers.',
      prepTime: 5,
      cookTime: 8,
      difficulty: 1,
      servings: 2,
      category: c.Snacks._id,
      cuisine: 'International',
      user: admin._id,
      imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Bread', 4, 'slice'),
        recipeIngredient(i, 'Cheese', 120, 'g'),
        recipeIngredient(i, 'Butter', 20, 'g'),
        recipeIngredient(i, 'Tomatoes', 80, 'g', true),
      ],
      steps: [
        recipeStep(1, 'Butter', 'Butter the bread lightly.'),
        recipeStep(2, 'Toast', 'Toast with cheese until melted.'),
        recipeStep(3, 'Cut', 'Cut into fingers and serve hot.'),
      ],
    },
    {
      title: 'Blueberry Energy Oats',
      description: 'No-fuss oats with blueberries and walnuts for an afternoon snack.',
      prepTime: 10,
      cookTime: 0,
      difficulty: 1,
      servings: 2,
      category: c.Snacks._id,
      cuisine: 'International',
      user: chef._id,
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1000&fit=crop',
      ingredients: [
        recipeIngredient(i, 'Oats', 100, 'g'),
        recipeIngredient(i, 'Blueberries', 125, 'g'),
        recipeIngredient(i, 'Walnuts', 40, 'g'),
        recipeIngredient(i, 'Honey', 15, 'g'),
      ],
      steps: [
        recipeStep(1, 'Mix', 'Mix oats with blueberries and walnuts.'),
        recipeStep(2, 'Sweeten', 'Add honey to taste.'),
        recipeStep(3, 'Chill', 'Chill briefly or serve immediately.'),
      ],
    },
  ].map((recipe) => ({ ...recipe, isPublic: true }));
}

export async function seedDemoData() {
  const passwordHash = await bcrypt.hash('saveur123', 12);
  const adminHash = await bcrypt.hash('admin12345', 12);

  const [chef, admin] = await Promise.all([
    User.findOneAndUpdate(
      { email: 'chef@saveur.local' },
      {
        name: 'Demo Chef',
        email: 'chef@saveur.local',
        passwordHash,
        role: 'user',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&fit=crop',
        preferredLanguage: 'en',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ),
    User.findOneAndUpdate(
      { email: 'admin@saveur.local' },
      {
        name: 'Saveur Admin',
        email: 'admin@saveur.local',
        passwordHash: adminHash,
        role: 'admin',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop',
        preferredLanguage: 'en',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ),
  ]);

  const categories = byName(await Promise.all(categorySeeds.map(ensureCategory)));

  const ingredients = byName(
    await Promise.all(
      ingredientSeeds.map((ingredient) =>
        Ingredient.findOneAndUpdate(
          { name: ingredient.name },
          {
            ...ingredient,
            nutritionCode: suggestNutritionCode(ingredient.name),
            // always rewritten from the USDA table, so weights stored by an older seed are corrected
            ...(gramsPerPieceFor(suggestNutritionCode(ingredient.name)) && {
              gramsPerUnit: gramsPerPieceFor(suggestNutritionCode(ingredient.name)),
            }),
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        )
      )
    )
  );

  for (const recipe of recipeSeeds(categories, ingredients, chef, admin)) {
    await Recipe.findOneAndUpdate(
      { title: recipe.title },
      { $set: recipe },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Demo data ready. Login with chef@saveur.local / saveur123.');
}
