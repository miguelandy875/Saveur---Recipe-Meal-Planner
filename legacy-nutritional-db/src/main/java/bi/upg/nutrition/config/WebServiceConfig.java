package bi.upg.nutrition.config;

import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.io.ClassPathResource;
import org.springframework.ws.config.annotation.EnableWs;
import org.springframework.ws.config.annotation.WsConfigurer;
import org.springframework.ws.server.EndpointInterceptor;
import org.springframework.ws.soap.server.endpoint.SoapFaultDefinition;
import org.springframework.ws.transport.http.MessageDispatcherServlet;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;
import org.springframework.xml.xsd.SimpleXsdSchema;
import org.springframework.xml.xsd.XsdSchema;
import org.springframework.ws.soap.server.endpoint.interceptor.PayloadValidatingInterceptor;

import java.util.List;

/** Configuration Spring-WS : servlet /ws/*, WSDL généré depuis le XSD, validation XSD, résolution des SOAP faults. */
@EnableWs
@Configuration
public class WebServiceConfig implements WsConfigurer {

    /** Servlet SOAP mappée sur /ws/* ; transformWsdlLocations réécrit l'adresse du WSDL selon l'hôte appelé. */
    @Bean
    public ServletRegistrationBean<MessageDispatcherServlet> messageDispatcherServlet(ApplicationContext context) {
        MessageDispatcherServlet servlet = new MessageDispatcherServlet();
        servlet.setApplicationContext(context);
        servlet.setTransformWsdlLocations(true);
        return new ServletRegistrationBean<>(servlet, "/ws/*");
    }

    /** Le NOM du bean = nom de l'URL du WSDL : http://localhost:8080/ws/mon-service.wsdl */
    @Bean(name = "mon-service")
    public DefaultWsdl11Definition monService(XsdSchema nutritionSchema) {
        DefaultWsdl11Definition wsdl = new DefaultWsdl11Definition();
        wsdl.setPortTypeName("NutritionPort");
        wsdl.setLocationUri("/ws");
        wsdl.setTargetNamespace("http://upg.bi/nutrition");
        wsdl.setSchema(nutritionSchema);
        return wsdl;
    }

    @Bean
    public XsdSchema nutritionSchema() {
        return new SimpleXsdSchema(new ClassPathResource("xsd/nutrition.xsd"));
    }

    /** Valide chaque requête ET chaque réponse contre le XSD : le contrat est réellement appliqué. */
    @Override
    public void addInterceptors(List<EndpointInterceptor> interceptors) {
        PayloadValidatingInterceptor validator = new PayloadValidatingInterceptor();
        validator.setXsdSchema(nutritionSchema());
        validator.setValidateRequest(true);
        validator.setValidateResponse(true);
        interceptors.add(validator);
    }

    /** Exceptions @SoapFault -> <soap:Fault>. Les autres exceptions deviennent un Fault "Server". */
    @Bean
    public NutritionFaultResolver nutritionFaultResolver() {
        NutritionFaultResolver resolver = new NutritionFaultResolver();
        resolver.setOrder(Ordered.HIGHEST_PRECEDENCE);
        SoapFaultDefinition defaultFault = new SoapFaultDefinition();
        defaultFault.setFaultCode(SoapFaultDefinition.SERVER);
        defaultFault.setFaultStringOrReason("Internal error in legacy-nutritional-db");
        resolver.setDefaultFault(defaultFault);
        return resolver;
    }
}
