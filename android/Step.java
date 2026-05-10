package com.saveur.models;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;
import androidx.room.PrimaryKey;

@Entity(
    tableName = "etapes",
    foreignKeys = @ForeignKey(
        entity = Recipe.class,
        parentColumns = "id",
        childColumns = "recette_id",
        onDelete = ForeignKey.CASCADE
    ),
    indices = {@Index("recette_id")}
)
public class Step {
    @PrimaryKey(autoGenerate = true)
    public long id;

    @ColumnInfo(name = "recette_id")
    public long recetteId;

    @ColumnInfo(name = "numero_etape")
    public int numeroEtape;

    public String description;
    public String image;

    public Step(long recetteId, int numeroEtape, String description, String image) {
        this.recetteId = recetteId;
        this.numeroEtape = numeroEtape;
        this.description = description;
        this.image = image;
    }
}
