package bi.upg.nutrition.exception;

import org.springframework.ws.soap.server.endpoint.annotation.FaultCode;
import org.springframework.ws.soap.server.endpoint.annotation.SoapFault;

import java.util.List;

/**
 * Levée quand au moins un code demandé n'existe pas en base.
 * {@code @SoapFault(faultCode = CLIENT)} : la faute vient de l'appelant, pas du serveur ;
 * Spring-WS la transforme en {@code <soap:Fault>} (faultcode soap:Client). Le faultstring est le message
 * de l'exception, et le détail structuré (codes inconnus) est ajouté par {@code NutritionFaultResolver}.
 */
@SoapFault(faultCode = FaultCode.CLIENT)
public class UnknownIngredientException extends RuntimeException {

    private final List<String> unknownCodes;

    public UnknownIngredientException(List<String> unknownCodes) {
        super((unknownCodes.size() == 1 ? "Unknown ingredient code: " : "Unknown ingredient codes: ")
                + String.join(", ", unknownCodes));
        this.unknownCodes = List.copyOf(unknownCodes);
    }

    public List<String> getUnknownCodes() {
        return unknownCodes;
    }
}
