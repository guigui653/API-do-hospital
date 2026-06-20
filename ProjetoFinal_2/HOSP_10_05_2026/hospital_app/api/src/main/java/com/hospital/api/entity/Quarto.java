package com.hospital.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quarto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idQuarto")
public class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_quarto")
    private Integer idQuarto;

    private String numero;

    private String andar;

    private Boolean ativo;
}
