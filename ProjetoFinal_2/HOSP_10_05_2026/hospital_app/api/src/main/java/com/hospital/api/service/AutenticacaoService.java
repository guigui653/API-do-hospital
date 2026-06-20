package com.hospital.api.service;

import com.hospital.api.repository.UsuarioRepository;
import com.hospital.api.repository.PacienteRepository;
import com.hospital.api.entity.Usuario;
import com.hospital.api.entity.Paciente;
import com.hospital.api.enums.TipoUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    private final UsuarioRepository repository;
    private final PacienteRepository pacienteRepository;

    @Autowired
    public AutenticacaoService(UsuarioRepository repository, PacienteRepository pacienteRepository) {
        this.repository = repository;
        this.pacienteRepository = pacienteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String cpfLimpo = username.replaceAll("\\D", "");

        var usuarioOpt = repository.findByCpf(cpfLimpo);
        if (usuarioOpt.isPresent() && usuarioOpt.get().getTipo() != TipoUsuario.PACIENTE) {
            return usuarioOpt.get();
        }

        var pacienteOpt = pacienteRepository.findByCpf(cpfLimpo);
        if (pacienteOpt.isEmpty() && cpfLimpo.length() == 11) {
            String cpfFormatado = cpfLimpo.substring(0, 3) + "." +
                                  cpfLimpo.substring(3, 6) + "." +
                                  cpfLimpo.substring(6, 9) + "-" +
                                  cpfLimpo.substring(9, 11);
            pacienteOpt = pacienteRepository.findByCpf(cpfFormatado);
        }

        if (pacienteOpt.isPresent()) {
            return pacienteOpt.get();
        }

        throw new UsernameNotFoundException("Usuário ou Paciente não encontrado no sistema com o CPF: " + username);
    }
}
