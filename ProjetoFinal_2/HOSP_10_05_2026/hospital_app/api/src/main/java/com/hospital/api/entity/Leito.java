package com.hospital.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leito")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idLeito")
public class Leito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_leito")
    private Integer idLeito;

    private String numero;

    @ManyToOne
    @JoinColumn(name = "id_quarto")
    private Quarto quarto;

    private Boolean ocupado;

    private Boolean ativo;
}
