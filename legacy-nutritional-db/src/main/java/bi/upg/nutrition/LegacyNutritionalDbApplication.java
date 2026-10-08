package bi.upg.nutrition;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Base nutritionnelle "legacy" : serveur SOAP contract-first (Spring-WS) adossé à une base SQL (JPA / H2).
 */
@SpringBootApplication
public class LegacyNutritionalDbApplication {

    public static void main(String[] args) {
        SpringApplication.run(LegacyNutritionalDbApplication.class, args);
    }
}
