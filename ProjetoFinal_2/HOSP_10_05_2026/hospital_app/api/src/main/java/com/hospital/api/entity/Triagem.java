package com.hospital.api.entity;

import com.hospital.api.dto.request.DadosTriagemDTO;
import com.hospital.api.enums.NivelUrgencia;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Table(name = "triagem")
@Entity(name = "Triagem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Triagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_triagem")
    private Long idtriagem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @Column(name = "nome_paciente", nullable = false)
    private String nomePaciente;

    @Column(name = "cpf", nullable = false)
    private String cpf;

    private Integer idade;

    @Column(name = "pressao_arterial")
    private String pressaoArterial;

    private Double temperatura;

    @Column(nullable = false)
    private String sintomas;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "urgencia", nullable = false)
    private NivelUrgencia urgencia;

    @Column(name = "data_triagem")
    private LocalDateTime dataTriagem = LocalDateTime.now();

    public Triagem(DadosTriagemDTO dados) {
        this.nomePaciente = dados.pacienteNome();
        this.cpf = dados.cpf();
        this.idade = dados.idade();
        this.pressaoArterial = dados.pressaoArterial();
        this.temperatura = dados.temperatura();
        this.sintomas = dados.sintomas();

        if (dados.nivelUrgencia() != null) {
            this.urgencia = dados.nivelUrgencia();
        }
    }
}
