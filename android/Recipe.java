package com.saveur.models;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;
import androidx.room.PrimaryKey;

@Entity(
    tableName = "recettes",
    foreignKeys = @ForeignKey(
        entity = Category.class,
        parentColumns = "id",
        childColumns = "categorie_id",
        onDelete = ForeignKey.CASCADE
    ),
    indices = {@Index("categorie_id")}
)
public class Recipe {
    @PrimaryKey(autoGenerate = true)
    public long id;
    
    public String titre;
    public String description;
    
    @ColumnInfo(name = "temps_preparation")
    public int tempsPreparation;
    
    @ColumnInfo(name = "temps_cuisson")
    public int tempsCuisson;
    
    public int difficulte;
    
    @ColumnInfo(name = "nombre_personnes")
    public int nombrePersonnes;
    
    @ColumnInfo(name = "categorie_id")
    public long categorieId;
    
    @ColumnInfo(name = "user_id")
    public String userId;
    
    public String image;

    public Recipe() {}
}
