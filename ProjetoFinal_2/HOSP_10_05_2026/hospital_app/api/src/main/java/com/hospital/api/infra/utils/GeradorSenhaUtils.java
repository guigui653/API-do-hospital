package com.hospital.api.infra.utils;

import java.security.SecureRandom;

public class GeradorSenhaUtils {

    private static final SecureRandom RANDOM = new SecureRandom();

    private GeradorSenhaUtils() {}

    public static String gerarSenhaAleatoria() {

        int numero = RANDOM.nextInt(1_000_000);
        return String.format("%06d", numero);
    }
}
