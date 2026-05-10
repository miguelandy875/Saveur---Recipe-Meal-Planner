import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { getCategories, getFeaturedRecipes, getFilteredRecipes, createRecipe, getUserRecipes } from '../services/recipeService';
import { CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  message?: string;
}

export const DebugTests: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Authentication Check', status: 'pending' },
    { name: 'Category Data Fetch', status: 'pending' },
    { name: 'Featured Recipes Sync', status: 'pending' },
    { name: 'Recipe Creation Flow', status: 'pending' },
    { name: 'Filtering Logic (Difficulty)', status: 'pending' },
    { name: 'User Management (My Recipes)', status: 'pending' },
  ]);

  const updateResult = (name: string, status: TestResult['status'], message?: string) => {
    setResults(prev => prev.map(r => r.name === name ? { ...r, status, message } : r));
  };

  const runTests = async () => {
    // 1. Auth Check
    updateResult('Authentication Check', 'running');
    if (user) {
      updateResult('Authentication Check', 'pass', `Logged in as ${user.email}`);
    } else {
      updateResult('Authentication Check', 'fail', 'User not authenticated');
    }

    // 2. Categories
    updateResult('Category Data Fetch', 'running');
    try {
      const cats = await getCategories();
      if (cats.length > 0) {
        updateResult('Category Data Fetch', 'pass', `Found ${cats.length} categories`);
      } else {
        updateResult('Category Data Fetch', 'fail', 'No categories found');
      }
    } catch (e) {
      updateResult('Category Data Fetch', 'fail', String(e));
    }

    // 3. Featured
    updateResult('Featured Recipes Sync', 'running');
    try {
      const featured = await getFeaturedRecipes(1);
      if (featured.length > 0) {
        updateResult('Featured Recipes Sync', 'pass', `Featured system active. First recipe: ${featured[0].title}`);
      } else {
        updateResult('Featured Recipes Sync', 'fail', 'No recipes found in collection');
      }
    } catch (e) {
      updateResult('Featured Recipes Sync', 'fail', String(e));
    }

    // 4. Creation (Only if logged in)
    if (user) {
      updateResult('Recipe Creation Flow', 'running');
      try {
        const testId = await createRecipe(
          {
            title: 'Test Automated Recipe',
            description: 'Created by the test runner',
            prepTime: 5,
            cookTime: 5,
            difficulty: 1,
            servings: 1,
            categoryId: 'test-cat',
            userId: user.uid,
            imageUrl: '',
            isPublic: false
          },
          [{ order: 1, description: 'Test step 1' }],
          [{ ingredientId: 'Water', quantity: 1, optional: false }]
        );
        if (testId) {
          updateResult('Recipe Creation Flow', 'pass', `Created test recipe with ID: ${testId}`);
        } else {
          updateResult('Recipe Creation Flow', 'fail', 'CreateRecipe returned null');
        }
      } catch (e) {
        updateResult('Recipe Creation Flow', 'fail', String(e));
      }
    } else {
      updateResult('Recipe Creation Flow', 'fail', 'Skipped: Not logged in');
    }

    // 5. Filtering
    updateResult('Filtering Logic (Difficulty)', 'running');
    try {
      const filtered = await getFilteredRecipes({ difficulty: 1 });
      updateResult('Filtering Logic (Difficulty)', 'pass', `Filter returned ${filtered.length} recipes for level 1`);
    } catch (e) {
      updateResult('Filtering Logic (Difficulty)', 'fail', String(e));
    }

    // 6. User Specific
    if (user) {
      updateResult('User Management (My Recipes)', 'running');
      try {
        const myRecipes = await getUserRecipes(user.uid);
        updateResult('User Management (My Recipes)', 'pass', `User has ${myRecipes.length} recipes`);
      } catch (e) {
        updateResult('User Management (My Recipes)', 'fail', String(e));
      }
    } else {
      updateResult('User Management (My Recipes)', 'fail', 'Skipped: Not logged in');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-serif">System Test Report</h1>
        <button 
          onClick={runTests}
          className="bg-brand-olive text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
        >
          <Play size={14} /> Run Suite
        </button>
      </header>

      <section className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-xs">
        {results.map((r, i) => (
          <div key={i} className="p-6 border-b border-gray-50 last:border-0 flex items-start gap-4">
            <div className="mt-1">
              {r.status === 'pending' && <div className="w-6 h-6 rounded-full border-2 border-gray-200" />}
              {r.status === 'running' && <Loader2 className="w-6 h-6 text-brand-olive animate-spin" />}
              {r.status === 'pass' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              {r.status === 'fail' && <XCircle className="w-6 h-6 text-red-500" />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{r.name}</h3>
              {r.message && <p className="text-sm text-gray-500 mt-1">{r.message}</p>}
            </div>
          </div>
        ))}
      </section>

      <div className="p-8 bg-gray-50 rounded-[32px] space-y-4">
        <h4 className="font-bold uppercase tracking-widest text-xs text-gray-400">Environment Metadata</h4>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-500">
          <div className="space-y-1">
            <p>Auth Ready: {String(!!user)}</p>
            <p>Database: Firestore</p>
          </div>
          <div className="space-y-1 text-right">
            <p>Env: Production-Preview</p>
            <p>Region: europe-west2</p>
          </div>
        </div>
      </div>
    </div>
  );
};
