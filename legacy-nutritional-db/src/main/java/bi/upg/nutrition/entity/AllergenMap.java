package bi.upg.nutrition.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Ligne de la table {@code allergen_map} : un allergène d'un ingrédient (FK vers ingredient_nutrition.id). */
@Entity
@Table(name = "allergen_map")
public class AllergenMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // BIGINT AUTO_INCREMENT

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private IngredientNutrition ingredient;

    @Column(name = "allergen_name", nullable = false, length = 50)
    private String allergenName;

    public Long getId() { return id; }
    public IngredientNutrition getIngredient() { return ingredient; }
    public String getAllergenName() { return allergenName; }
}
