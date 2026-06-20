package com.hospital.api.entity;

import com.hospital.api.enums.StatusChamado;
import com.hospital.api.enums.TipoChamado;
import com.hospital.api.entity.Paciente;
import com.hospital.api.entity.Leito;
import com.hospital.api.entity.Servico;
import com.hospital.api.entity.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chamado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idChamado")
public class Chamado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_chamado")
    private long idChamado;

    @ManyToOne
    @JoinColumn(name = "id_paciente")
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "id_leito")
    private Leito leito;

    @ManyToOne
    @JoinColumn(name = "id_servico")
    private Servico servico;

    @ManyToOne
    @JoinColumn(name = "id_colaborador")
    private Usuario colaborador;

    @Enumerated(EnumType.STRING)
    private StatusChamado status;

    @Enumerated(EnumType.STRING)
    private TipoChamado tipo;

    private String prioridade;

    private String observacao;

    @Column(name = "data_abertura")
    private LocalDateTime dataAbertura;

    @Column(name = "data_inicio_atend")
    private LocalDateTime dataInicioAtend;

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    @Column(name = "nota_avaliacao")
    private Integer notaAvaliacao;

    @Column(name = "comentario_avaliacao")
    private String comentarioAvaliacao;

    @Column(name = "descricao_resolucao")
    private String descricaoResolucao;
}
