
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

@Service
public class DetalleMedicamentoServiceImpl
        implements IDetalleMedicamentoService {

    private final DetalleMedicamentoRepository detalleMedicamentoRepository;
    private final DetalleRecetaRepository detalleRecetaRepository;
    private final MedicamentoRepository medicamentoRepository;

    public DetalleMedicamentoServiceImpl(
            DetalleMedicamentoRepository detalleMedicamentoRepository,
            DetalleRecetaRepository detalleRecetaRepository,
            MedicamentoRepository medicamentoRepository) {

        this.detalleMedicamentoRepository = detalleMedicamentoRepository;
        this.detalleRecetaRepository = detalleRecetaRepository;
        this.medicamentoRepository = medicamentoRepository;
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

        if (dto.cantidadEntregada() == null ||
                dto.cantidadEntregada() <= 0) {

            throw new IllegalArgumentException(
                    "La cantidad entregada debe ser mayor a cero");
        }

        // Buscar detalle de receta
        DetalleReceta detalleReceta = detalleRecetaRepository
                .findById(dto.idDetalleReceta())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Detalle de receta no encontrado"));

        // Obtener medicamento prescrito
        Medicamento medicamento = detalleReceta.getMedicamento();

        if (medicamento == null) {
            throw new ResourceNotFoundException(
                    "Medicamento no encontrado");
        }

        // Calcular cantidades entregadas anteriormente
        List<DetalleMedicamento> entregasAnteriores =
                detalleMedicamentoRepository
                        .findByDetalleReceta_IdDetalleReceta(
                                dto.idDetalleReceta());

        int cantidadEntregadaAnterior = entregasAnteriores.stream()
                .mapToInt(d -> d.getCantidadEntregada() == null
                        ? 0 : d.getCantidadEntregada())
                .sum();

        // Calcular cantidad pendiente
        int cantidadPrescrita = detalleReceta.getCantidad();

        int cantidadPendiente =
                cantidadPrescrita - cantidadEntregadaAnterior;

        if (dto.cantidadEntregada() > cantidadPendiente) {

            throw new IllegalArgumentException(
                    "La cantidad entregada supera la cantidad pendiente de la receta");
        }

        // Verificar stock disponible
        if (medicamento.getStock() == null ||
                medicamento.getStock() < dto.cantidadEntregada()) {

            throw new IllegalArgumentException(
                    "Stock insuficiente para realizar la entrega");
        }

        // Descontar stock automáticamente
        medicamento.setStock(
                medicamento.getStock() - dto.cantidadEntregada()
        );

        medicamentoRepository.save(medicamento);

        // Registrar salida del medicamento
        DetalleMedicamento detalle = new DetalleMedicamento();

        detalle.setDetalleReceta(detalleReceta);
        detalle.setCantidadEntregada(dto.cantidadEntregada());
        detalle.setFechaSalida(LocalDate.now());

        DetalleMedicamento guardado =
                detalleMedicamentoRepository.save(detalle);

        return convertirResponseDTO(guardado);
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

    // Listar salidas por fecha
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
