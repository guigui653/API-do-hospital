package com.hospital.api.infra.seeder;

import com.hospital.api.entity.Paciente;
import com.hospital.api.repository.PacienteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(
            PacienteRepository pacienteRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.pacienteRepository = pacienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println(">>> SEEDER: Usuário Administrador Mestre já existe no banco. <<<");
        System.out.println("====== INICIANDO MIGRAÇÃO DE SENHAS DE PACIENTES PARA 3 DÍGITOS ======");

        List<Paciente> pacientes = pacienteRepository.findAll();
        for (Paciente paciente : pacientes) {
            if (paciente.getCpf() != null && !paciente.getCpf().isBlank()) {

                String cpfLimpo = paciente.getCpf().replaceAll("[^0-9]", "");

                if (cpfLimpo.length() >= 3) {
                    String senhaInicial = cpfLimpo.substring(0, 3);
                    String senhaCriptografada = passwordEncoder.encode(senhaInicial);

                    paciente.setSenha(senhaCriptografada);

                    pacienteRepository.save(paciente);
                }
            }
        }

        System.out.println("====== MIGRAÇÃO CONCLUÍDA ======");
    }
}
