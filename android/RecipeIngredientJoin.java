package com.saveur.models;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;
import androidx.room.PrimaryKey;

@Entity(
    tableName = "recette_ingredients",
    foreignKeys = {
        @ForeignKey(entity = Recipe.class, parentColumns = "id", childColumns = "recette_id"),
        @ForeignKey(entity = Ingredient.class, parentColumns = "id", childColumns = "ingredient_id")
    },
    indices = {@Index("recette_id"), @Index("ingredient_id")}
)
public class RecipeIngredientJoin {
    @PrimaryKey(autoGenerate = true)
    public long id;

    @ColumnInfo(name = "recette_id")
    public long recetteId;

    @ColumnInfo(name = "ingredient_id")
    public long ingredientId;

    public float quantite;
    public boolean optionnel;

    public RecipeIngredientJoin(long recetteId, long ingredientId, float quantite, boolean optionnel) {
        this.recetteId = recetteId;
        this.ingredientId = ingredientId;
        this.quantite = quantite;
        this.optionnel = optionnel;
    }
}
