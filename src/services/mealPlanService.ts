import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Recipe } from '../types';

export interface MealPlanEntry {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  recipeId: string;
  mealType: string; // breakfast, lunch, dinner, snack
}

export const getMealPlanForDate = async (userId: string, date: string) => {
  const path = 'mealPlans';
  try {
    const q = query(collection(db, path), where('userId', '==', userId), where('date', '==', date));
    const snapshot = await getDocs(q);
    
    // We also want to fetch the recipe details for each entry
    const entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MealPlanEntry));
    
    const entriesWithRecipes = await Promise.all(entries.map(async (entry) => {
      try {
        const recipeDocRef = doc(db, 'recipes', entry.recipeId);
        const recipeSnap = await getDoc(recipeDocRef);
        const recipeData = recipeSnap.exists() ? recipeSnap.data() as Recipe : null;
        
        return {
          ...entry,
          recipe: recipeData ? { ...recipeData, id: recipeSnap.id } : null
        };
      } catch (e) {
        console.error('Error fetching recipe for meal plan:', e);
        return { ...entry, recipe: null };
      }
    }));

    return entriesWithRecipes;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addToMealPlan = async (userId: string, date: string, recipeId: string, mealType: string) => {
  const path = 'mealPlans';
  try {
    // Check if entry already exists for this type/date/user
    const q = query(
      collection(db, path), 
      where('userId', '==', userId), 
      where('date', '==', date),
      where('mealType', '==', mealType)
    );
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      // Update existing
      const entryId = existing.docs[0].id;
      await setDoc(doc(db, path, entryId), {
        userId,
        date,
        recipeId,
        mealType,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return entryId;
    } else {
      // Add new
      const docRef = await addDoc(collection(db, path), {
        userId,
        date,
        recipeId,
        mealType,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return null;
  }
};

export const removeFromMealPlan = async (entryId: string) => {
  const path = `mealPlans/${entryId}`;
  try {
    await deleteDoc(doc(db, 'mealPlans', entryId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
};
