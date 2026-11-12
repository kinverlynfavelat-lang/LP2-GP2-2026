
package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.upeu.centromedico.centro_medico.dto.DetalleMedicamentoDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.DetalleMedicamentoResponseDTO;

import pe.edu.upeu.centromedico.centro_medico.entity.*;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;

import pe.edu.upeu.centromedico.centro_medico.repository.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import java.math.BigDecimal;

@Service
public class DetalleMedicamentoServiceImpl
        implements IDetalleMedicamentoService {

    private final DetalleMedicamentoRepository detalleMedicamentoRepository;
    private final DetalleRecetaRepository detalleRecetaRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DetalleMedicamentoServiceImpl(
            DetalleMedicamentoRepository detalleMedicamentoRepository,
            DetalleRecetaRepository detalleRecetaRepository) {

        this.detalleMedicamentoRepository = detalleMedicamentoRepository;
        this.detalleRecetaRepository = detalleRecetaRepository;
    }


    // Listar todas las entregas
    @Override
    @Transactional(readOnly = true)
    public List<DetalleMedicamentoResponseDTO> listarTodo() {

        return detalleMedicamentoRepository.findAll()
                .stream()
                .map(this::convertirResponseDTO)
                .toList();
    }

    // Buscar entrega por ID
    @Override
    @Transactional(readOnly = true)
    public Optional<DetalleMedicamentoResponseDTO> buscarPorId(Long id) {

        return detalleMedicamentoRepository.findById(id)
                .map(this::convertirResponseDTO);
    }

    // Registrar entrega y descontar stock automáticamente

    @Override
    @Transactional
    public DetalleMedicamentoResponseDTO registrarEntrega(
            DetalleMedicamentoDTO dto) {

        // 1. Validar datos de entrada
        if (dto == null || dto.idDetalleReceta() == null) {
            throw new IllegalArgumentException(
                    "Debe indicar el detalle de receta");
        }

        if (dto.cantidadEntregada() == null ||
                dto.cantidadEntregada() <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad entregada debe ser mayor a cero");
        }

        // 2. Llamar al procedimiento almacenado de Oracle
        StoredProcedureQuery procedimiento =
                entityManager.createStoredProcedureQuery(
                        "SP_REGISTRAR_ENTREGA_MEDICAMENTO");

        procedimiento.registerStoredProcedureParameter(
                1, Long.class, ParameterMode.IN);

        procedimiento.registerStoredProcedureParameter(
                2, Integer.class, ParameterMode.IN);

        procedimiento.registerStoredProcedureParameter(
                3, BigDecimal.class, ParameterMode.OUT);

        procedimiento.setParameter(1, dto.idDetalleReceta());
        procedimiento.setParameter(2, dto.cantidadEntregada());

        procedimiento.execute();

        // 3. Obtener el ID generado
        Number resultado =
                (Number) procedimiento.getOutputParameterValue(3);

        Long idEntrega = resultado.longValue();

        // 4. Consultar la entrega registrada
        DetalleMedicamento entrega =
                detalleMedicamentoRepository.findById(idEntrega)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Entrega no encontrada"));

        // 5. Devolver los datos al frontend
        return convertirResponseDTO(entrega);
    }


    // Listar entregas por detalle de receta
    @Override
    @Transactional(readOnly = true)
    public List<DetalleMedicamentoResponseDTO> listarPorDetalleReceta(
            Long idDetalleReceta) {

        if (!detalleRecetaRepository.existsById(idDetalleReceta)) {
            throw new ResourceNotFoundException(
                    "Detalle de receta no encontrado");
        }

        return detalleMedicamentoRepository
                .findByDetalleReceta_IdDetalleReceta(idDetalleReceta)
                .stream()
                .map(this::convertirResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DetalleMedicamentoResponseDTO> listarPorFecha(
            LocalDate fecha) {

        return detalleMedicamentoRepository
                .findByFechaSalida(fecha)
                .stream()
                .map(this::convertirResponseDTO)
                .toList();
    }
    // Listar salidas por periodo
    @Override
    @Transactional(readOnly = true)
    public List<DetalleMedicamentoResponseDTO> listarPorPeriodo(
            LocalDate fechaInicio,
            LocalDate fechaFin) {

        if (fechaInicio == null || fechaFin == null ||
                fechaInicio.isAfter(fechaFin)) {

            throw new IllegalArgumentException(
                    "El periodo de fechas no es válido");
        }

        return detalleMedicamentoRepository
                .findByFechaSalidaBetween(fechaInicio, fechaFin)
                .stream()
                .map(this::convertirResponseDTO)
                .toList();
    }

    // Convertir entidad a DTO
    private DetalleMedicamentoResponseDTO convertirResponseDTO(
            DetalleMedicamento d) {

        DetalleReceta detalleReceta = d.getDetalleReceta();

        Medicamento medicamento = detalleReceta.getMedicamento();

        Receta receta = detalleReceta.getReceta();

        Cita cita = receta.getCita();

        Persona persona = cita.getPersona();

        String paciente = persona.getNombres()
                + " " + persona.getApellidos();

        return new DetalleMedicamentoResponseDTO(

                d.getIdDetalleMedicamento(),

                detalleReceta.getIdDetalleReceta(),

                medicamento.getIdMedicamento(),

                medicamento.getNombre(),

                detalleReceta.getCantidad(),

                d.getCantidadEntregada(),

                d.getFechaSalida(),

                receta.getIdReceta(),

                cita.getIdCita(),

                persona.getIdPersona(),

                paciente
        );
    }

}
