package com.hospital.api.repository;

import com.hospital.api.entity.Internacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternacaoRepository extends JpaRepository<Internacao, Integer> {
}
