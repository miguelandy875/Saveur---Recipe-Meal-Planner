package bi.upg.nutrition.endpoint;

import bi.upg.nutrition.entity.AllergenMap;
import bi.upg.nutrition.entity.IngredientNutrition;
import bi.upg.nutrition.generated.AllergenListType;
import bi.upg.nutrition.generated.AllergenNameType;
import bi.upg.nutrition.generated.GetNutritionalValuesRequestType;
import bi.upg.nutrition.generated.GetNutritionalValuesResponseType;
import bi.upg.nutrition.generated.IngredientNutritionType;
import bi.upg.nutrition.generated.ObjectFactory;
import bi.upg.nutrition.service.NutritionService;
import jakarta.xml.bind.JAXBElement;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

/**
 * Endpoint SOAP : reçoit {@code <getNutritionalValuesRequest>}, interroge SQL (via NutritionService / Spring Data JPA)
 * et renvoie {@code <getNutritionalValuesResponse>}.
 *
 * Les types du XSD étant NOMMÉS (donc sans @XmlRootElement), le payload est échangé sous forme de
 * {@link JAXBElement} construit avec l'{@link ObjectFactory} générée par XJC.
 */
@Endpoint
public class NutritionEndpoint {

    public static final String NAMESPACE_URI = "http://upg.bi/nutrition";

    private final NutritionService nutritionService;
    private final ObjectFactory objectFactory = new ObjectFactory();

    public NutritionEndpoint(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getNutritionalValuesRequest")
    @ResponsePayload
    public JAXBElement<GetNutritionalValuesResponseType> getNutritionalValues(
            @RequestPayload JAXBElement<GetNutritionalValuesRequestType> request) {

        GetNutritionalValuesResponseType response = objectFactory.createGetNutritionalValuesResponseType();
        for (IngredientNutrition row : nutritionService.findByCodes(request.getValue().getIngredientCode())) {
            response.getIngredient().add(toXml(row));
        }
        return objectFactory.createGetNutritionalValuesResponse(response);
    }

    /** Entité JPA -> type JAXB généré (mapping SQL -> XML, voir tableau du README). */
    private IngredientNutritionType toXml(IngredientNutrition row) {
        IngredientNutritionType xml = objectFactory.createIngredientNutritionType();
        xml.setDatabaseId(row.getId());
        xml.setIngredientId(row.getIngredientCode());
        xml.setName(row.getName());
        xml.setCaloriesPer100G(row.getCaloriesPer100g());
        xml.setProteins(row.getProteinsG());
        xml.setCarbs(row.getCarbsG());
        xml.setFats(row.getFatsG());
        xml.setPublisher(row.getPublisher());

        AllergenListType allergens = objectFactory.createAllergenListType();
        for (AllergenMap allergen : row.getAllergens()) {
            allergens.getAllergen().add(AllergenNameType.valueOf(allergen.getAllergenName()));
        }
        xml.setAllergens(allergens);
        return xml;
    }
}
