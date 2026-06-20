package com.hospital.api.entity;

import com.hospital.api.enums.TipoUsuario;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idUsuario")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    private String nome;

    private String cpf;

    private String email;

    private String telefone;

    private String senha;

    @Enumerated(EnumType.STRING)
    private TipoUsuario tipo;

    private Boolean ativo;

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        if (this.tipo != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + this.tipo.name().toUpperCase()));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {

        return cpf;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return ativo; }

    public void inativar() {
        this.ativo = false;
    }
}
