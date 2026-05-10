import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

const categories = [
  { name: 'Petit Déjeuner', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&fit=crop' },
  { name: 'Plat Principal', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop' },
  { name: 'Dessert', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&fit=crop' },
  { name: 'Apéritif', image: 'https://images.unsplash.com/photo-1541535881962-3bb380b08458?w=400&fit=crop' },
];

const recipes = [
  {
    title: 'Tagliatelles au Gorgonzola',
    description: 'Une recette crémeuse et gourmande avec des noix croquantes.',
    prepTime: 10,
    cookTime: 10,
    difficulty: 2,
    servings: 2,
    categoryId: '', // to be filled
    userId: 'system',
    imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=600&fit=crop',
    isPublic: true,
  },
  {
    title: 'Poulet Rôti aux Herbes',
    description: 'Un classique indémodable, parfait pour le dimanche.',
    prepTime: 15,
    cookTime: 60,
    difficulty: 3,
    servings: 4,
    categoryId: '',
    userId: 'system',
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&fit=crop',
    isPublic: true,
  },
  {
    title: 'Tarte au Citron Meringuée',
    description: 'Le parfait équilibre entre acidité et douceur.',
    prepTime: 40,
    cookTime: 20,
    difficulty: 4,
    servings: 8,
    categoryId: '',
    userId: 'system',
    imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&fit=crop',
    isPublic: true,
  }
];

export const seedDatabase = async () => {
  if (!auth.currentUser) return; // Exit if not signed in

  const catPath = 'categories';
  try {
    const catSnapshot = await getDocs(collection(db, catPath));
    if (!catSnapshot.empty) return; // Already seeded
  } catch (error) {
    console.warn('Could not check seed status', error);
    return;
  }

  console.log('Seeding database...');
  const catIds: Record<string, string> = {};

  try {
    for (const cat of categories) {
      const docRef = await addDoc(collection(db, catPath), cat);
      catIds[cat.name] = docRef.id;
    }

    const recipeCol = collection(db, 'recipes');
    
    // Tagliatelles -> Plat Principal
    await addDoc(recipeCol, { 
      ...recipes[0], 
      categoryId: catIds['Plat Principal'],
      createdAt: new Date().toISOString() // Use ISO string for simplicity in seed
    });
    // Poulet -> Plat Principal
    await addDoc(recipeCol, { 
      ...recipes[1], 
      categoryId: catIds['Plat Principal'],
      createdAt: new Date().toISOString()
    });
    // Tarte -> Dessert
    await addDoc(recipeCol, { 
      ...recipes[2], 
      categoryId: catIds['Dessert'],
      createdAt: new Date().toISOString()
    });

    console.log('Seeding complete!');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seeding');
  }
};
