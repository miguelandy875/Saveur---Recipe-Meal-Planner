import { collection, query, where, getDocs, doc, getDoc, limit, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Recipe, Category, RecipeStep, RecipeIngredient } from '../types';

export const getFeaturedRecipes = async (limitCount = 5) => {
  const path = 'recipes';
  try {
    const q = query(collection(db, path), where('isPublic', '==', true), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getCategories = async () => {
  const path = 'categories';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getRecipeById = async (id: string) => {
  const path = `recipes/${id}`;
  try {
    const docRef = doc(db, 'recipes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Recipe;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const getFilteredRecipes = async (filters: { categoryId?: string, difficulty?: number, maxTime?: number }) => {
  const path = 'recipes';
  try {
    let q = query(collection(db, path), where('isPublic', '==', true));
    
    if (filters.categoryId) {
      q = query(q, where('categoryId', '==', filters.categoryId));
    }
    
    if (filters.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty));
    }

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));

    // Client-side filter for time if needed (Firestore inequalities on different fields are tricky)
    if (filters.maxTime) {
      results = results.filter(r => (r.prepTime + r.cookTime) <= filters.maxTime!);
    }

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const createRecipe = async (
  recipeData: Omit<Recipe, 'id' | 'createdAt'>, 
  steps: Omit<RecipeStep, 'id'>[], 
  ingredients: Omit<RecipeIngredient, 'id'>[]
) => {
  const path = 'recipes';
  try {
    // 1. Create the main recipe document
    const recipeRef = await addDoc(collection(db, path), {
      ...recipeData,
      createdAt: serverTimestamp()
    });

    // 2. Add steps to sub-collection
    const stepsPath = `${path}/${recipeRef.id}/steps`;
    for (const step of steps) {
      await addDoc(collection(db, stepsPath), step);
    }

    // 3. Add ingredients to sub-collection
    const ingPath = `${path}/${recipeRef.id}/ingredients`;
    for (const ing of ingredients) {
      await addDoc(collection(db, ingPath), ing);
    }

    return recipeRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return null;
  }
};

export const getUserRecipes = async (userId: string) => {
  const path = 'recipes';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const toggleFavorite = async (userId: string, recipeId: string, isFavorite: boolean) => {
  const path = `users/${userId}/favorites`;
  try {
    if (isFavorite) {
      await addDoc(collection(db, path), { recipeId, createdAt: serverTimestamp() });
    } else {
      const q = query(collection(db, path), where('recipeId', '==', recipeId));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(d => deleteDoc(doc(db, path, d.id)));
      await Promise.all(deletePromises);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
