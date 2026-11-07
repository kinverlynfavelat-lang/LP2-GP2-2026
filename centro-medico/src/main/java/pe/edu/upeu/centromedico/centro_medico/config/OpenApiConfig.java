package pe.edu.upeu.centromedico.centro_medico.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Centro Médico UPeU API")
                        .version("1.0")
                        .description("Documentación de los servicios REST del Centro Médico UPeU"));
    }

}
