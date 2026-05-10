package com.saveur.repository;

import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.CollectionReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;
import com.saveur.models.Recipe;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RecipeRepository {
    private final FirebaseFirestore db = FirebaseFirestore.getInstance();
    private final CollectionReference recipesRef = db.collection("recipes");

    public Task<QuerySnapshot> getFeaturedRecipes(int limit) {
        return recipesRef
                .whereEqualTo("isPublic", true)
                .limit(limit)
                .get();
    }

    public Task<QuerySnapshot> getFilteredRecipes(String categoryId, Integer difficulty) {
        Query query = recipesRef.whereEqualTo("isPublic", true);
        
        if (categoryId != null) {
            query = query.whereEqualTo("categoryId", categoryId);
        }
        
        if (difficulty != null) {
            query = query.whereEqualTo("difficulty", difficulty);
        }
        
        return query.get();
    }

    public void createRecipe(Recipe recipe, List<Map<String, Object>> steps, List<Map<String, Object>> ingredients) {
        recipesRef.add(recipe).addOnSuccessListener(documentReference -> {
            String recipeId = documentReference.getId();
            
            // Add Steps
            for (Map<String, Object> step : steps) {
                recipesRef.document(recipeId).collection("steps").add(step);
            }
            
            // Add Ingredients
            for (Map<String, Object> ingredient : ingredients) {
                recipesRef.document(recipeId).collection("ingredients").add(ingredient);
            }
        });
    }
}
