package bi.upg.nutrition.config;

import bi.upg.nutrition.exception.UnknownIngredientException;
import bi.upg.nutrition.generated.GetNutritionalValuesFaultType;
import bi.upg.nutrition.generated.ObjectFactory;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.JAXBException;
import org.springframework.ws.soap.SoapFault;
import org.springframework.ws.soap.SoapFaultDetail;
import org.springframework.ws.soap.server.endpoint.SoapFaultAnnotationExceptionResolver;

/**
 * Transforme les exceptions annotées {@code @SoapFault} en {@code <soap:Fault>} (comportement de la classe mère)
 * ET ajoute dans {@code <detail>} l'élément {@code getNutritionalValuesFault} déclaré dans le XSD
 * (la liste des codes inconnus), pour que le contrat WSDL (wsdl:fault) soit réellement respecté.
 */
public class NutritionFaultResolver extends SoapFaultAnnotationExceptionResolver {

    private final JAXBContext jaxbContext;
    private final ObjectFactory objectFactory = new ObjectFactory();

    public NutritionFaultResolver() {
        try {
            this.jaxbContext = JAXBContext.newInstance(ObjectFactory.class);
        } catch (JAXBException e) {
            throw new IllegalStateException("Cannot create JAXB context for the fault detail", e);
        }
    }

    @Override
    protected void customizeFault(Object endpoint, Exception ex, SoapFault fault) {
        super.customizeFault(endpoint, ex, fault);
        if (ex instanceof UnknownIngredientException unknown) {
            GetNutritionalValuesFaultType detailType = objectFactory.createGetNutritionalValuesFaultType();
            detailType.getUnknownCode().addAll(unknown.getUnknownCodes());
            SoapFaultDetail detail = fault.addFaultDetail();
            try {
                jaxbContext.createMarshaller()
                        .marshal(objectFactory.createGetNutritionalValuesFault(detailType), detail.getResult());
            } catch (JAXBException e) {
                logger.warn("Could not marshal the SOAP fault detail", e);
            }
        }
    }
}
