package com.hospital.api.infra.doc;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("API - Sistema de Gestão Hospitalar")
                        .description(
                                "API RESTful do sistema Cuidar+ para gestão hospitalar completa. " +
                                "Gerencia pacientes, internações, chamados de leito, quartos e colaboradores. " +
                                "Autenticação via JWT (Bearer Token). " +
                                "Para testar rotas protegidas, faça login em POST /pacientes/login " +
                                "e clique no botão 'Authorize' acima para inserir o token retornado."
                        )
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipe Cuidar+")
                                .email("contato@appcuidar.com")
                        )
                )
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Insira o token JWT obtido no endpoint /pacientes/login")
                        )
                );
    }
}
