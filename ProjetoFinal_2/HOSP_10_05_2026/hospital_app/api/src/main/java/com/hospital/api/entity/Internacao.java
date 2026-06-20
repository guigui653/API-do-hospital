package com.hospital.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "internacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idInternacao")
public class Internacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_internacao")
    private Integer idInternacao;

    @ManyToOne
    @JoinColumn(name = "id_paciente")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "id_leito")
    private Leito leito;

    @Column(name = "data_entrada")
    private LocalDate dataEntrada;

    @Column(name = "data_saida")
    private LocalDate dataSaida;

    @Column(name = "motivo_internacao")
    private String motivoInternacao;

    @Column(name = "medico_responsavel")
    private String medicoResponsavel;

    private String convenio;

    private Boolean ativo;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;
}
