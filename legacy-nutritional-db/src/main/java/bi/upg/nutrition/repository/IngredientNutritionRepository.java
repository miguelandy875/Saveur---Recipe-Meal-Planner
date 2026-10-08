package bi.upg.nutrition.repository;

import bi.upg.nutrition.entity.IngredientNutrition;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface IngredientNutritionRepository extends JpaRepository<IngredientNutrition, Long> {

    /**
     * Une seule requête SQL (JOIN FETCH sur allergen_map) pour TOUTES les codes demandés :
     * évite le problème N+1 et toute LazyInitializationException hors transaction web.
     */
    @EntityGraph(attributePaths = "allergens")
    List<IngredientNutrition> findByIngredientCodeIn(Collection<String> ingredientCodes);
}
