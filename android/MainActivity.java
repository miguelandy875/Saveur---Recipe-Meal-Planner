package com.saveur.ui;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.saveur.R;
import com.saveur.models.Recipe;
import com.saveur.repository.RecipeRepository;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private RecipeRepository repository;
    private RecipeAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        repository = new RecipeRepository();
        setupRecyclerView();
        loadFeaturedRecipes();
    }

    private void setupRecyclerView() {
        RecyclerView rv = findViewById(R.id.recipes_rv);
        rv.setLayoutManager(new GridLayoutManager(this, 2));
        adapter = new RecipeAdapter();
        rv.setAdapter(adapter);
    }

    private void loadFeaturedRecipes() {
        repository.getFeaturedRecipes(10).addOnSuccessListener(queryDocumentSnapshots -> {
            List<Recipe> recipes = queryDocumentSnapshots.toObjects(Recipe.class);
            adapter.setRecipes(recipes);
        }).addOnFailureListener(e -> {
            Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        });
    }
}
