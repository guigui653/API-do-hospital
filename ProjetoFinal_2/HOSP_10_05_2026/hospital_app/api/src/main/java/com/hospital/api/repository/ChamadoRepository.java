package com.hospital.api.repository;

import com.hospital.api.entity.Chamado;
import com.hospital.api.enums.StatusChamado;
import com.hospital.api.enums.TipoChamado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChamadoRepository extends JpaRepository<Chamado, Long> {

    List<Chamado> findByStatus(StatusChamado status);

    List<Chamado> findByStatusIn(List<StatusChamado> statuses);

    List<Chamado> findByServicoCategoriaIdCategoria(Integer idCategoria);

    List<Chamado> findByTipo(TipoChamado tipo);

    List<Chamado> findByTipoAndStatusIn(TipoChamado tipo, List<StatusChamado> statuses);

    List<Chamado> findByPacienteIdPaciente(Long idPaciente);

    List<Chamado> findByPacienteIdPacienteAndStatusInAndDataConclusaoAfter(
            Long idPaciente,
            List<StatusChamado> statuses,
            LocalDateTime desde
    );
}
