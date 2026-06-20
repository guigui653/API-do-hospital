package com.hospital.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Table(name = "notificacao")
@Entity(name = "Notificacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacao")
    private Long idNotificacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(nullable = false)
    private String mensagem;

    @Column(nullable = false)
    private Boolean lida = false;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Notificacao(Paciente paciente, String mensagem) {
        this.paciente = paciente;
        this.mensagem = mensagem;
        this.lida = false;
        this.criadoEm = LocalDateTime.now();
    }
}
