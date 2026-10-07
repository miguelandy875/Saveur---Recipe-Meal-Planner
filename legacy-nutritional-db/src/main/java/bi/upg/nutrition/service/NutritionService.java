package bi.upg.nutrition.service;

import bi.upg.nutrition.entity.IngredientNutrition;
import bi.upg.nutrition.exception.UnknownIngredientException;
import bi.upg.nutrition.repository.IngredientNutritionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Logique métier de la base nutritionnelle : résolution d'une liste de codes en lignes SQL. */
@Service
public class NutritionService {

    private final IngredientNutritionRepository repository;

    public NutritionService(IngredientNutritionRepository repository) {
        this.repository = repository;
    }

    /**
     * Retourne une ligne par code DISTINCT, dans l'ordre de la requête.
     * Politique d'erreur (tout ou rien) : si un ou plusieurs codes sont inconnus, on lève
     * {@link UnknownIngredientException} listant TOUS les codes inconnus ; aucun résultat partiel n'est renvoyé.
     */
    @Transactional(readOnly = true)
    public List<IngredientNutrition> findByCodes(List<String> requestedCodes) {
        LinkedHashSet<String> codes = new LinkedHashSet<>(requestedCodes); // dédoublonnage, ordre conservé

        Map<String, IngredientNutrition> byCode = repository.findByIngredientCodeIn(codes).stream()
                .collect(Collectors.toMap(IngredientNutrition::getIngredientCode, Function.identity()));

        List<String> unknown = codes.stream().filter(code -> !byCode.containsKey(code)).toList();
        if (!unknown.isEmpty()) {
            throw new UnknownIngredientException(unknown);
        }

        List<IngredientNutrition> ordered = new ArrayList<>();
        codes.forEach(code -> ordered.add(byCode.get(code)));
        return ordered;
    }
}
