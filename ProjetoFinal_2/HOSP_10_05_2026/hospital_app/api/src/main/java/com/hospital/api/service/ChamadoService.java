package com.hospital.api.service;

import com.hospital.api.dto.request.AvaliacaoRequestDTO;
import com.hospital.api.dto.request.ChamadoAtualizacaoDTO;
import com.hospital.api.dto.request.ChamadoRequestDTO;
import com.hospital.api.dto.request.PedidoRapidoRequestDTO;
import com.hospital.api.dto.request.FinalizarChamadoRequestDTO;
import com.hospital.api.dto.response.ChamadoResponseDTO;
import com.hospital.api.entity.Chamado;
import com.hospital.api.entity.Leito;
import com.hospital.api.entity.Paciente;
import com.hospital.api.entity.Servico;
import com.hospital.api.entity.Usuario;
import com.hospital.api.enums.StatusChamado;
import com.hospital.api.enums.TipoChamado;
import com.hospital.api.repository.ChamadoRepository;
import com.hospital.api.repository.PacienteRepository;
import com.hospital.api.repository.LeitoRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;
    private final PacienteRepository pacienteRepository;
    private final LeitoRepository leitoRepository;

    public ChamadoService(ChamadoRepository chamadoRepository,
                          PacienteRepository pacienteRepository,
                          LeitoRepository leitoRepository) {
        this.chamadoRepository = chamadoRepository;
        this.pacienteRepository = pacienteRepository;
        this.leitoRepository = leitoRepository;
    }

    @Transactional
    public ChamadoResponseDTO abrirChamado(ChamadoRequestDTO dto) {
        Paciente paciente = resolverPaciente(dto.idPaciente());

        Chamado chamado = new Chamado();
        chamado.setPaciente(paciente);

        // Se idLeito vier nulo, tenta resolver com o leito associado ao cadastro do paciente
        Leito leito = null;
        if (dto.idLeito() != null) {
            leito = leitoRef(dto.idLeito());
        } else if (paciente.getLeito() != null && !paciente.getLeito().isBlank()) {
            leito = leitoRepository.findByNumero(paciente.getLeito()).orElse(null);
        }
        chamado.setLeito(leito);

        chamado.setServico(dto.idServico() != null ? servicoRef(dto.idServico()) : null);
        chamado.setObservacao(dto.observacao() != null ? dto.observacao() : "Chamado aberto via app.");
        chamado.setStatus(StatusChamado.ABERTO);
        chamado.setPrioridade("MEDIA");
        chamado.setDataAbertura(LocalDateTime.now());
        chamado.setTipo(dto.tipo() != null ? dto.tipo() : TipoChamado.ENFERMAGEM);

        chamadoRepository.save(chamado);
        return new ChamadoResponseDTO(chamado);
    }

    @Transactional
    public ChamadoResponseDTO abrirPedidoRapido(PedidoRapidoRequestDTO dto) {
        var auth      = SecurityContextHolder.getContext().getAuthentication();
        var usuario   = (Usuario) auth.getPrincipal();
        Paciente paciente = pacienteRepository.findByCpf(usuario.getCpf())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado para o usuário logado."));

        Chamado chamado = new Chamado();
        chamado.setPaciente(paciente);
        chamado.setLeito(null);
        chamado.setServico(null);
        chamado.setTipo(TipoChamado.PEDIDO_RAPIDO);
        chamado.setObservacao("Pedido Rápido: " + dto.idItem());
        chamado.setStatus(StatusChamado.ABERTO);
        chamado.setPrioridade("BAIXA");
        chamado.setDataAbertura(LocalDateTime.now());

        chamadoRepository.save(chamado);
        return new ChamadoResponseDTO(chamado);
    }

    @Transactional
    public ChamadoResponseDTO confirmarAtendimento(Long idChamado) {
        Chamado chamado = chamadoRepository.findById(idChamado)
                .orElseThrow(() -> new RuntimeException("Chamado #" + idChamado + " não encontrado."));

        if (chamado.getStatus() != StatusChamado.ABERTO) {
            throw new RuntimeException(
                "Chamado #" + idChamado + " já está " + chamado.getStatus().name() +
                " — somente chamados ABERTOS podem ser atendidos."
            );
        }

        chamado.setStatus(StatusChamado.EM_ATENDIMENTO);
        chamado.setDataInicioAtend(LocalDateTime.now());
        chamadoRepository.save(chamado);

        return new ChamadoResponseDTO(chamado);
    }

    @Transactional
    public ChamadoResponseDTO finalizarAtendimento(Long idChamado, FinalizarChamadoRequestDTO dto) {
        Chamado chamado = chamadoRepository.findById(idChamado)
                .orElseThrow(() -> new RuntimeException("Chamado #" + idChamado + " não encontrado."));

        if (chamado.getStatus() != StatusChamado.EM_ATENDIMENTO) {
            throw new RuntimeException("Apenas chamados EM_ATENDIMENTO podem ser finalizados.");
        }

        chamado.setStatus(StatusChamado.CONCLUIDO);
        chamado.setDescricaoResolucao(dto.descricaoResolucao());
        chamado.setDataConclusao(LocalDateTime.now());
        chamadoRepository.save(chamado);

        return new ChamadoResponseDTO(chamado);
    }

    @Transactional(readOnly = true)
    public List<ChamadoResponseDTO> listarTodos() {
        return chamadoRepository.findAll().stream().map(ChamadoResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ChamadoResponseDTO> listarPorPaciente(Long idPaciente) {
        return chamadoRepository.findByPacienteIdPaciente(idPaciente)
                .stream()
                .map(ChamadoResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChamadoResponseDTO buscarPorId(Long id) {
        return chamadoRepository.findById(id)
                .map(ChamadoResponseDTO::new)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<ChamadoResponseDTO> listarAtivos() {
        return chamadoRepository.findByStatusIn(
                List.of(StatusChamado.ABERTO, StatusChamado.EM_ATENDIMENTO, StatusChamado.CONCLUIDO)
        ).stream().map(ChamadoResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ChamadoResponseDTO> listarPorStatus(StatusChamado status) {
        return chamadoRepository.findByStatus(status).stream().map(ChamadoResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ChamadoResponseDTO> listarPorTipo(TipoChamado tipo) {
        return chamadoRepository.findByTipo(tipo).stream().map(ChamadoResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<ChamadoResponseDTO> listarPorCategoria(Integer idCategoria) {
        return chamadoRepository.findByServicoCategoriaIdCategoria(idCategoria)
                .stream().map(ChamadoResponseDTO::new).toList();
    }

    @Transactional
    public ChamadoResponseDTO atualizarChamado(Long id, ChamadoAtualizacaoDTO dto) {
        Chamado chamado = chamadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado"));
        if (dto.status()    != null) chamado.setStatus(dto.status());
        if (dto.observacao() != null) chamado.setObservacao(dto.observacao());
        chamadoRepository.save(chamado);
        return new ChamadoResponseDTO(chamado);
    }

    @Transactional
    public void deletarChamado(Long id) {
        chamadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado"));
        chamadoRepository.deleteById(id);
    }

    @Transactional
    public ChamadoResponseDTO avaliarChamado(Long idChamado, AvaliacaoRequestDTO dto) {
        Chamado chamado = chamadoRepository.findById(idChamado)
                .orElseThrow(() -> new RuntimeException("Chamado #" + idChamado + " não encontrado."));

        if (chamado.getStatus() != StatusChamado.CONCLUIDO && chamado.getStatus() != StatusChamado.FINALIZADO) {
            throw new IllegalStateException("Somente chamados CONCLUIDOS ou FINALIZADOS podem ser avaliados.");
        }

        chamado.setNotaAvaliacao(dto.nota());
        chamado.setComentarioAvaliacao(dto.comentario());

        chamado.setStatus(StatusChamado.FINALIZADO);
        chamadoRepository.save(chamado);

        return new ChamadoResponseDTO(chamado);
    }

    @Transactional
    public ChamadoResponseDTO finalizarChamadoPaciente(Long idChamado) {
        Chamado chamado = chamadoRepository.findById(idChamado)
                .orElseThrow(() -> new RuntimeException("Chamado #" + idChamado + " não encontrado."));

        if (chamado.getStatus() != StatusChamado.EM_ATENDIMENTO && chamado.getStatus() != StatusChamado.ABERTO) {
            throw new RuntimeException("Apenas chamados ABERTOS ou EM_ATENDIMENTO podem ser finalizados pelo paciente.");
        }

        var auth = SecurityContextHolder.getContext().getAuthentication();
        var principal = auth.getPrincipal();
        String pacienteCpf = null;

        if (principal instanceof Paciente) {
            pacienteCpf = ((Paciente) principal).getCpf();
        } else if (principal instanceof Usuario) {
            pacienteCpf = ((Usuario) principal).getCpf();
        }

        if (pacienteCpf == null || chamado.getPaciente() == null ||
            (!chamado.getPaciente().getCpf().replaceAll("\\D", "").equals(pacienteCpf.replaceAll("\\D", "")))) {
            throw new RuntimeException("Apenas o paciente que abriu o chamado pode finalizá-lo.");
        }

        chamado.setStatus(StatusChamado.FINALIZADO);
        chamado.setDataConclusao(LocalDateTime.now());
        if (chamado.getDescricaoResolucao() == null || chamado.getDescricaoResolucao().isBlank()) {
            chamado.setDescricaoResolucao("Finalizado pelo paciente via aplicativo mobile.");
        }
        chamadoRepository.save(chamado);

        return new ChamadoResponseDTO(chamado);
    }

    @Transactional(readOnly = true)
    public List<ChamadoResponseDTO> obterHistorico24Horas(Long idPaciente) {
        LocalDateTime desde = LocalDateTime.now().minusHours(24);
        List<StatusChamado> statusFinais = List.of(StatusChamado.FINALIZADO, StatusChamado.CANCELADO);
        return chamadoRepository.findByPacienteIdPacienteAndStatusInAndDataConclusaoAfter(idPaciente, statusFinais, desde)
                .stream()
                .map(ChamadoResponseDTO::new)
                .toList();
    }

    private Paciente resolverPaciente(Long idPaciente) {
        if (idPaciente != null) {
            return pacienteRepository.findById(idPaciente)
                    .orElseThrow(() -> new RuntimeException("Paciente #" + idPaciente + " não encontrado."));
        }

        var auth    = SecurityContextHolder.getContext().getAuthentication();
        var usuario = (Usuario) auth.getPrincipal();
        return pacienteRepository.findByCpf(usuario.getCpf())
                .orElseThrow(() -> new RuntimeException("Paciente correspondente ao usuário logado não encontrado."));
    }

    private Leito leitoRef(Integer idLeito) {
        Leito l = new Leito();
        l.setIdLeito(idLeito);
        return l;
    }

    private Servico servicoRef(Integer idServico) {
        Servico s = new Servico();
        s.setIdServico(idServico);
        return s;
    }
}
