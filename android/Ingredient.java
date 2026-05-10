package com.saveur.models;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "ingredients")
public class Ingredient {
    @PrimaryKey(autoGenerate = true)
    public long id;
    public String nom;
    public String unite;
    public int calories_par_unite;

    public Ingredient(String nom, String unite, int calories_par_unite) {
        this.nom = nom;
        this.unite = unite;
        this.calories_par_unite = calories_par_unite;
    }
}
