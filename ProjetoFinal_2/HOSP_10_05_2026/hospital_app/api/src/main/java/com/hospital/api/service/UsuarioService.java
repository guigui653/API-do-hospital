package com.hospital.api.service;

import com.hospital.api.dto.request.UsuarioRequestDTO;
import com.hospital.api.dto.response.UsuarioResponseDTO;
import com.hospital.api.entity.Usuario;
import com.hospital.api.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponseDTO cadastrar(UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setCpf(dto.cpf().replaceAll("\\D", ""));
        usuario.setEmail(dto.email());
        usuario.setTelefone(dto.telefone());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setTipo(dto.tipo());
        usuario.setAtivo(true);
        usuario.setCriadoEm(LocalDateTime.now());

        usuarioRepository.save(usuario);
        return new UsuarioResponseDTO(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
        return new UsuarioResponseDTO(usuario);
    }

    @Transactional
    public void deletar(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario nao encontrado para exclusao"));

        usuario.inativar();
        usuarioRepository.save(usuario);
    }
}
