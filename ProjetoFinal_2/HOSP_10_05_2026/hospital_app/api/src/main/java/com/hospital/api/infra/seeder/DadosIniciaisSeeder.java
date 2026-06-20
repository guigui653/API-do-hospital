package com.hospital.api.infra.seeder;

import com.hospital.api.entity.Usuario;
import com.hospital.api.enums.TipoUsuario;
import com.hospital.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DadosIniciaisSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Remove as restrições NOT NULL de chamado(id_leito, id_servico) em tempo de execução no banco local
        try {
            jdbcTemplate.execute("ALTER TABLE chamado ALTER COLUMN id_leito DROP NOT NULL;");
            jdbcTemplate.execute("ALTER TABLE chamado ALTER COLUMN id_servico DROP NOT NULL;");
            System.out.println(">>> SEEDER: Restrições NOT NULL de id_leito e id_servico na tabela chamado removidas com sucesso! <<<");
        } catch (Exception e) {
            System.out.println(">>> SEEDER: Colunas de chamado já são opcionais ou a tabela não existe ainda (será criada pelo Hibernate). " + e.getMessage() + " <<<");
        }

        String cpfMestre = "99988877766";

        if (usuarioRepository.findByCpf(cpfMestre) == null) {
            Usuario admin = new Usuario();
            admin.setNome("Guilherme Mestre");
            admin.setCpf(cpfMestre);
            admin.setEmail("mestre@hospital.com");
            admin.setSenha(passwordEncoder.encode("123"));
            admin.setTipo(TipoUsuario.ADMIN);
            admin.setAtivo(true);
            admin.setCriadoEm(LocalDateTime.now());

            usuarioRepository.save(admin);
            System.out.println(">>> SEEDER: Usuário Administrador Mestre criado com sucesso! <<<");
        } else {
            System.out.println(">>> SEEDER: Usuário Administrador Mestre já existe no banco. <<<");
        }
    }
}
