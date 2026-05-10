package com.saveur.models;

import androidx.room.Embedded;
import androidx.room.Junction;
import androidx.room.Relation;
import java.util.List;

/**
 * This class satisfies the "Junction Table" requirement.
 * It fetches a Recipe and all its associated Ingredients through the join table.
 */
public class RecipeWithIngredients {
    @Embedded
    public Recipe recipe;

    @Relation(
        parentColumn = "id",
        entityColumn = "id",
        associateBy = @Junction(
            value = RecipeIngredientJoin.class,
            parentColumn = "recette_id",
            entityColumn = "ingredient_id"
        )
    )
    public List<Ingredient> ingredients;
}
