package com.saveur.models;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "categories_recettes")
public class Category {
    @PrimaryKey(autoGenerate = true)
    public long id;
    public String nom;
    public String image;

    public Category(String nom, String image) {
        this.nom = nom;
        this.image = image;
    }
}
