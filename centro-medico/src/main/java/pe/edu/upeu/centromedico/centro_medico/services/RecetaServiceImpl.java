package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.centromedico.centro_medico.dto.DetalleRecetaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.DetalleRecetaResponseDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.RecetaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.RecetaResponseDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Cita;
import pe.edu.upeu.centromedico.centro_medico.entity.DetalleReceta;
import pe.edu.upeu.centromedico.centro_medico.entity.Medicamento;
import pe.edu.upeu.centromedico.centro_medico.entity.Receta;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoCita;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;
import pe.edu.upeu.centromedico.centro_medico.repository.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

@Service
public class RecetaServiceImpl implements IRecetaService {

    private final RecetaRepository recetaRepository;
    private final DetalleRecetaRepository detalleRecetaRepository;
    private final CitaRepository citaRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final PersonaRepository personaRepository;

    public RecetaServiceImpl(RecetaRepository recetaRepository, DetalleRecetaRepository detalleRecetaRepository, CitaRepository citaRepository, MedicamentoRepository medicamentoRepository, PersonaRepository personaRepository) {
        this.recetaRepository = recetaRepository;
        this.detalleRecetaRepository = detalleRecetaRepository;
        this.citaRepository = citaRepository;
        this.medicamentoRepository = medicamentoRepository;
        this.personaRepository = personaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecetaResponseDTO> listarTodo() {

        return recetaRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RecetaResponseDTO> buscarPorId(Long id) {

        return recetaRepository.findById(id)
                .map(this::convertToResponseDTO);
    }

    @Override
    @Transactional
    public RecetaResponseDTO crear(RecetaDTO dto) {

        Cita cita = citaRepository.findById(dto.idCita())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cita no encontrada"));

        // No se permite emitir receta si el paciente fue derivado
        if (cita.getEstado() == EstadoCita.DERIVADO) {
            throw new RuntimeException(
                    "No se puede emitir una receta porque el paciente fue derivado");
        }

        if (cita.getDiagnostico() == null ||
                cita.getDiagnostico().isBlank()) {
            throw new RuntimeException(
                    "La cita debe tener un diagnóstico para emitir la receta");
        }

        if (cita.getTratamiento() == null ||
                cita.getTratamiento().isBlank()) {
            throw new RuntimeException(
                    "La cita debe tener un tratamiento para emitir la receta");
        }

        Receta receta = new Receta();

        receta.setCita(cita);
        receta.setFechaEmision(LocalDate.now());

        Receta recetaGuardada = recetaRepository.save(receta);

        // Registrar los medicamentos prescritos
        for (DetalleRecetaDTO d : dto.detalles()) {

            Medicamento medicamento = medicamentoRepository
                    .findById(d.idMedicamento())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Medicamento no encontrado"));

            DetalleReceta detalle = new DetalleReceta();

            detalle.setReceta(recetaGuardada);
            detalle.setMedicamento(medicamento);
            detalle.setDosis(d.dosis());
            detalle.setIndicaciones(d.indicaciones());
            detalle.setCantidad(d.cantidad());

            detalleRecetaRepository.save(detalle);
        }

        return convertToResponseDTO(recetaGuardada);
    }

    @Override
    @Transactional
    public Optional<RecetaResponseDTO> actualizar(
            Long id,
            RecetaDTO dto) {

        return recetaRepository.findById(id).map(receta -> {

            Cita cita = citaRepository.findById(dto.idCita())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Cita no encontrada"));

            if (cita.getEstado() == EstadoCita.DERIVADO) {
                throw new RuntimeException(
                        "No se puede actualizar una receta de un paciente derivado");
            }

            if (cita.getDiagnostico() == null ||
                    cita.getDiagnostico().isBlank() ||
                    cita.getTratamiento() == null ||
                    cita.getTratamiento().isBlank()) {
                throw new RuntimeException(
                        "La cita debe tener diagnóstico y tratamiento");
            }

            receta.setCita(cita);

            // Eliminar los detalles anteriores
            List<DetalleReceta> detallesAnteriores =
                    detalleRecetaRepository.findByRecetaIdReceta(id);

            detalleRecetaRepository.deleteAll(detallesAnteriores);

            // Registrar los nuevos detalles
            for (DetalleRecetaDTO d : dto.detalles()) {

                Medicamento medicamento = medicamentoRepository
                        .findById(d.idMedicamento())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Medicamento no encontrado"));

                DetalleReceta detalle = new DetalleReceta();

                detalle.setReceta(receta);
                detalle.setMedicamento(medicamento);
                detalle.setDosis(d.dosis());
                detalle.setIndicaciones(d.indicaciones());
                detalle.setCantidad(d.cantidad());

                detalleRecetaRepository.save(detalle);
            }

            return convertToResponseDTO(
                    recetaRepository.save(receta));
        });
    }

    @Override
    @Transactional
    public boolean eliminar(Long id) {

        if (!recetaRepository.existsById(id)) {
            return false;
        }

        List<DetalleReceta> detalles =
                detalleRecetaRepository.findByRecetaIdReceta(id);

        detalleRecetaRepository.deleteAll(detalles);

        recetaRepository.deleteById(id);

        return true;
    }

    private RecetaResponseDTO convertToResponseDTO(Receta r) {

        Cita cita = r.getCita();

        String paciente = cita.getPersona().getNombres()
                + " " + cita.getPersona().getApellidos();

        Integer edad = null;

        if (cita.getPersona().getFechaNacimiento() != null) {
            edad = Period.between(
                    cita.getPersona().getFechaNacimiento(),
                    LocalDate.now()
            ).getYears();
        }

        List<DetalleRecetaResponseDTO> detalles =
                detalleRecetaRepository.findByRecetaIdReceta(r.getIdReceta())
                        .stream()
                        .map(d -> new DetalleRecetaResponseDTO(
                                d.getIdDetalleReceta(),
                                d.getMedicamento().getIdMedicamento(),
                                d.getMedicamento().getNombre(),
                                d.getDosis(),
                                d.getIndicaciones(),
                                d.getCantidad()
                        ))
                        .toList();

        return new RecetaResponseDTO(
                r.getIdReceta(),
                cita.getIdCita(),
                r.getFechaEmision(),
                paciente,
                edad,
                cita.getDiagnostico(),
                cita.getTratamiento(),
                detalles
        );
    }
}