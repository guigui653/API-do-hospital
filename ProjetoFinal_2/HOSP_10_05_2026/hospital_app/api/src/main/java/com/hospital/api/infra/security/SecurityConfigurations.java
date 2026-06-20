package com.hospital.api.infra.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http

                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.setAllowedOriginPatterns(java.util.List.of("*"));
                    corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
                    corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
                    corsConfiguration.setAllowCredentials(true);
                    return corsConfiguration;
                }))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(req -> {

                    req.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                    req.requestMatchers("/triagem.html", "/fila.html", "/static/**", "/css/**", "/js/**", "/images/**").permitAll();

                    req.requestMatchers(HttpMethod.POST, "/pacientes").permitAll();
                    req.requestMatchers(HttpMethod.POST, "/pacientes/login").permitAll();

                    req.requestMatchers(HttpMethod.POST, "/usuarios/login", "/login", "/auth/login").permitAll();

                    req.requestMatchers(HttpMethod.POST, "/api/auth/login", "/pacientes/login").permitAll();

                    req.requestMatchers("/api/triagem/**", "/triagem/**").permitAll();

                    req.requestMatchers("/chamados", "/chamados/**", "/api/chamados", "/api/chamados/**").permitAll();
                    req.requestMatchers("/categorias", "/categorias/**", "/api/categorias", "/api/categorias/**").permitAll();
                    req.requestMatchers("/servicos", "/servicos/**", "/api/servicos", "/api/servicos/**").permitAll();
                    req.requestMatchers("/leitos", "/leitos/**", "/api/leitos", "/api/leitos/**").permitAll();
                    req.requestMatchers("/internacoes", "/internacoes/**", "/api/internacoes", "/api/internacoes/**").permitAll();
                    req.requestMatchers("/quartos", "/quartos/**", "/api/quartos", "/api/quartos/**").permitAll();
                    req.requestMatchers("/api/avaliacoes", "/api/avaliacoes/**", "/avaliacoes", "/avaliacoes/**").permitAll();

                    req.requestMatchers(HttpMethod.POST, "/esqueceu-senha").permitAll();

                    req.requestMatchers(HttpMethod.POST, "/api/auth/esqueci-senha", "/api/auth/resetar-senha").permitAll();

                    req.requestMatchers("/ws/**", "/ws/info/**").permitAll();

                    req.requestMatchers("/ws-sock/**", "/ws-sock/info/**").permitAll();

                    req.requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll();

                    req.anyRequest().authenticated();
                })
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
