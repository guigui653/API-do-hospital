package com.hospital.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Table(name = "avaliacao")
@Entity(name = "Avaliacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_avaliacao")
    private Long idAvaliacao;

    @Column(name = "id_internacao", nullable = false)
    private Long idInternacao;

    @Column(nullable = false)
    private Integer nota;

    @Column(name = "comentario")
    private String comentario;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm = LocalDateTime.now();
}
