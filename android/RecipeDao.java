package com.saveur.db;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Transaction;
import com.saveur.models.Recipe;
import com.saveur.models.RecipeWithIngredients;
import java.util.List;

@Dao
public interface RecipeDao {
    @Insert
    long insertRecipe(Recipe recipe);

    @Transaction
    @Query("SELECT * FROM recettes WHERE id = :recipeId")
    RecipeWithIngredients getRecipeWithIngredients(long recipeId);

    @Query("SELECT * FROM recettes WHERE difficulte <= :maxDiff")
    List<Recipe> getRecipesByDifficulty(int maxDiff);

    @Query("SELECT * FROM recettes WHERE categorie_id = :categoryId")
    List<Recipe> getRecipesByCategory(long categoryId);
}
