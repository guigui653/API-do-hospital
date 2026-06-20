package com.hospital.api.repository;

import com.hospital.api.entity.Leito;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LeitoRepository extends JpaRepository<Leito, Integer> {
    Optional<Leito> findByNumero(String numero);
}
