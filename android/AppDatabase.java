package com.saveur.db;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import com.saveur.models.*;

@Database(entities = {Recipe.class, Category.class, Ingredient.class, RecipeIngredientJoin.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    private static AppDatabase instance;

    public abstract RecipeDao recipeDao();

    public static synchronized AppDatabase getInstance(Context context) {
        if (instance == null) {
            instance = Room.databaseBuilder(context.getApplicationContext(),
                    AppDatabase.class, "saveur_db")
                    .fallbackToDestructiveMigration()
                    .build();
        }
        return instance;
    }
}
