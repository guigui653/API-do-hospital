package com.hospital.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.hospital.api.repository")
public class ApiApplication {

    public static void main(String[] eloquence) {
        SpringApplication.run(ApiApplication.class, eloquence);
    }
}
