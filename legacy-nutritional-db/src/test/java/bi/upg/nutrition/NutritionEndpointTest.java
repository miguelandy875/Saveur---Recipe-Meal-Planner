package bi.upg.nutrition;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.ws.test.server.MockWebServiceClient;
import org.springframework.xml.transform.StringSource;

import javax.xml.transform.Source;

import static org.springframework.ws.test.server.RequestCreators.withPayload;
import static org.springframework.ws.test.server.ResponseMatchers.clientOrSenderFault;
import static org.springframework.ws.test.server.ResponseMatchers.validPayload;
import static org.springframework.ws.test.server.ResponseMatchers.xpath;

/** Tests d'intégration de l'endpoint (sans réseau) : mêmes intercepteurs, JPA et XSD que l'application. */
@SpringBootTest
class NutritionEndpointTest {

    private static final String NS = "http://upg.bi/nutrition";
    private static final java.util.Map<String, String> NS_MAP = java.util.Map.of("n", NS);

    @Autowired
    private ApplicationContext context;

    private MockWebServiceClient client;

    @BeforeEach
    void setUp() {
        client = MockWebServiceClient.createClient(context);
    }

    private static Source request(String... codes) {
        StringBuilder xml = new StringBuilder("<getNutritionalValuesRequest xmlns=\"" + NS + "\">");
        for (String code : codes) {
            xml.append("<ingredientCode>").append(code).append("</ingredientCode>");
        }
        return new StringSource(xml.append("</getNutritionalValuesRequest>").toString());
    }

    @Test
    void returnsOneEntryPerCodeWithAllergensInRequestOrder() throws Exception {
        client.sendRequest(withPayload(request("FLOUR_WHEAT", "TOMATO", "CHOCOLATE_MILK")))
                .andExpect(validPayload(new ClassPathResource("xsd/nutrition.xsd")))
                .andExpect(xpath("count(/n:getNutritionalValuesResponse/n:ingredient)", NS_MAP).evaluatesTo(3))
                .andExpect(xpath("/n:getNutritionalValuesResponse/n:ingredient[1]/n:ingredientId", NS_MAP).evaluatesTo("FLOUR_WHEAT"))
                .andExpect(xpath("/n:getNutritionalValuesResponse/n:ingredient[1]/n:caloriesPer100g", NS_MAP).evaluatesTo("364.00"))
                .andExpect(xpath("count(/n:getNutritionalValuesResponse/n:ingredient[1]/n:allergens/n:allergen)", NS_MAP).evaluatesTo(1))
                // TOMATO : aucun allergène -> <allergens/> présent mais vide
                .andExpect(xpath("count(/n:getNutritionalValuesResponse/n:ingredient[2]/n:allergens/n:allergen)", NS_MAP).evaluatesTo(0))
                // CHOCOLATE_MILK : plusieurs allergènes
                .andExpect(xpath("count(/n:getNutritionalValuesResponse/n:ingredient[3]/n:allergens/n:allergen)", NS_MAP).evaluatesTo(2));
    }

    @Test
    void commonIngredientsAddedFromUsdaAreAvailable() throws Exception {
        client.sendRequest(withPayload(request("ONION", "GREEN_PEPPER", "GARLIC", "CARROT", "BELL_PEPPER", "SALT", "BEEF")))
                .andExpect(validPayload(new ClassPathResource("xsd/nutrition.xsd")))
                .andExpect(xpath("count(/n:getNutritionalValuesResponse/n:ingredient)", NS_MAP).evaluatesTo(7))
                .andExpect(xpath("/n:getNutritionalValuesResponse/n:ingredient[1]/n:caloriesPer100g", NS_MAP).evaluatesTo("40.00"))
                .andExpect(xpath("/n:getNutritionalValuesResponse/n:ingredient[2]/n:caloriesPer100g", NS_MAP).evaluatesTo("20.00"))
                .andExpect(xpath("/n:getNutritionalValuesResponse/n:ingredient[2]/n:carbs", NS_MAP).evaluatesTo("4.64"));
    }

    @Test
    void xyzAndSaffronStayUnknownSoTheFaultDemoStillWorks() throws Exception {
        client.sendRequest(withPayload(request("TOMATO", "XYZ", "SAFFRON")))
                .andExpect(clientOrSenderFault("Unknown ingredient codes: XYZ, SAFFRON"));
    }

    @Test
    void duplicateCodesAreReturnedOnce() throws Exception {
        client.sendRequest(withPayload(request("BUTTER", "BUTTER")))
                .andExpect(xpath("count(/n:getNutritionalValuesResponse/n:ingredient)", NS_MAP).evaluatesTo(1));
    }

    @Test
    void unknownCodeBecomesClientSoapFaultListingEveryUnknownCode() throws Exception {
        client.sendRequest(withPayload(request("TOMATO", "XYZ", "ABC")))
                .andExpect(clientOrSenderFault("Unknown ingredient codes: XYZ, ABC"))
                .andExpect(xpath("count(//n:getNutritionalValuesFault/n:unknownCode)", NS_MAP).evaluatesTo(2));
    }

    @Test
    void requestViolatingTheXsdIsRejectedByValidation() throws Exception {
        // minuscules : interdites par le pattern [A-Z0-9_]+ de IngredientCodeType
        client.sendRequest(withPayload(request("tomato"))).andExpect(clientOrSenderFault());
    }

    @Test
    void emptyListIsRejectedByValidation() throws Exception {
        client.sendRequest(withPayload(request())).andExpect(clientOrSenderFault());
    }
}
