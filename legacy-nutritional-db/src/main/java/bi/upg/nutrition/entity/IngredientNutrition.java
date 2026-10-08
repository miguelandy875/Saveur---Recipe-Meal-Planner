package bi.upg.nutrition.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Ligne de la table {@code ingredient_nutrition} : valeurs nutritionnelles pour 100 g. */
@Entity
@Table(name = "ingredient_nutrition")
public class IngredientNutrition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // BIGINT AUTO_INCREMENT

    @Column(name = "ingredient_code", nullable = false, unique = true, length = 50)
    private String ingredientCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "calories_per_100g", nullable = false, precision = 7, scale = 2)
    private BigDecimal caloriesPer100g;

    @Column(name = "proteins_g", nullable = false, precision = 5, scale = 2)
    private BigDecimal proteinsG;

    @Column(name = "carbs_g", nullable = false, precision = 5, scale = 2)
    private BigDecimal carbsG;

    @Column(name = "fats_g", nullable = false, precision = 5, scale = 2)
    private BigDecimal fatsG;

    /** Lazy : toujours chargé via @EntityGraph dans le repository (pas d'OSIV hors MVC). */
    @OneToMany(mappedBy = "ingredient", fetch = FetchType.LAZY)
    private List<AllergenMap> allergens = new ArrayList<>();

    public Long getId() { return id; }
    public String getIngredientCode() { return ingredientCode; }
    public String getName() { return name; }
    public BigDecimal getCaloriesPer100g() { return caloriesPer100g; }
    public BigDecimal getProteinsG() { return proteinsG; }
    public BigDecimal getCarbsG() { return carbsG; }
    public BigDecimal getFatsG() { return fatsG; }
    public List<AllergenMap> getAllergens() { return allergens; }
}
