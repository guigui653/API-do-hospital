package com.hospital.api.infra.security;

import com.hospital.api.repository.UsuarioRepository;
import com.hospital.api.repository.PacienteRepository;
import com.hospital.api.entity.Usuario;
import com.hospital.api.entity.Paciente;
import com.hospital.api.enums.TipoUsuario;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var tokenJWT = recuperarToken(request);

        if (tokenJWT != null) {
            try {
                var subject = tokenService.getSubject(tokenJWT);

                org.springframework.security.core.userdetails.UserDetails userDetails = usuarioRepository.findByCpf(subject)
                        .filter(u -> u.getTipo() != TipoUsuario.PACIENTE)
                        .map(u -> (org.springframework.security.core.userdetails.UserDetails) u)
                        .orElse(null);

                if (userDetails == null) {
                    userDetails = pacienteRepository.findByCpf(subject).orElse(null);
                }
                if (userDetails == null && subject.length() == 11) {
                    String subjectFormatado = subject.substring(0, 3) + "." +
                                              subject.substring(3, 6) + "." +
                                              subject.substring(6, 9) + "-" +
                                              subject.substring(9, 11);
                    userDetails = pacienteRepository.findByCpf(subjectFormatado).orElse(null);
                }

                if (userDetails != null) {
                    var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (RuntimeException e) {

            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            var token = authorizationHeader.replace("Bearer ", "").trim();
            return token.isBlank() ? null : token;
        }
        return null;
    }
}
