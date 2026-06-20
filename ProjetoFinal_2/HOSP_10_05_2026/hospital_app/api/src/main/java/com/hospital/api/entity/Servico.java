package com.hospital.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "servico")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servico")
    private Integer idServico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @Column(name = "nome", length = 100, nullable = false)
    private String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "tempo_estimado_min", nullable = false)
    private Short tempoEstimadoMin = 30;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "destaque_tela_inicial")
    private Boolean destaqueTelaInicial;

    public Servico() {}
}
