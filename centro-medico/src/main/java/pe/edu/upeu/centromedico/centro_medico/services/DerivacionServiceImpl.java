package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.centromedico.centro_medico.dto.DerivacionDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.DerivacionResponseDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Cita;
import pe.edu.upeu.centromedico.centro_medico.entity.Derivacion;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;
import pe.edu.upeu.centromedico.centro_medico.repository.CitaRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.DerivacionRepository;

import java.util.List;
import java.util.Optional;

@Service
public class DerivacionServiceImpl implements IDerivacionService {

    private final DerivacionRepository derivacionRepository;
    private final CitaRepository citaRepository;

    public DerivacionServiceImpl(
            DerivacionRepository derivacionRepository,
            CitaRepository citaRepository) {

        this.derivacionRepository = derivacionRepository;
        this.citaRepository = citaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DerivacionResponseDTO> listarTodo() {

        return derivacionRepository.findAll()
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DerivacionResponseDTO> buscarPorId(Long id) {

        return derivacionRepository.findById(id)
                .map(this::convertirResponse);
    }

    @Override
    @Transactional
    public DerivacionResponseDTO crear(DerivacionDTO dto) {

        Cita cita = citaRepository.findById(dto.idCita())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cita no encontrada"));

        Derivacion derivacion = new Derivacion();

        derivacion.setFecha(dto.fecha());
        derivacion.setMotivo(dto.motivo());
        derivacion.setCentroDestino(dto.centroDestino());
        derivacion.setResponsable(dto.responsable());
        derivacion.setEstado(dto.estado());
        derivacion.setCita(cita);

        Derivacion guardada =
                derivacionRepository.save(derivacion);

        return convertirResponse(guardada);
    }

    @Override
    @Transactional
    public Optional<DerivacionResponseDTO> actualizar(
            Long id,
            DerivacionDTO dto) {

        return derivacionRepository.findById(id)
                .map(derivacion -> {

                    Cita cita = citaRepository.findById(dto.idCita())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Cita no encontrada"));

                    derivacion.setFecha(dto.fecha());
                    derivacion.setMotivo(dto.motivo());
                    derivacion.setCentroDestino(dto.centroDestino());
                    derivacion.setResponsable(dto.responsable());
                    derivacion.setEstado(dto.estado());
                    derivacion.setCita(cita);

                    Derivacion actualizada =
                            derivacionRepository.save(derivacion);

                    return convertirResponse(actualizada);
                });
    }

    @Override
    @Transactional
    public boolean eliminar(Long id) {

        if (!derivacionRepository.existsById(id)) {
            return false;
        }

        derivacionRepository.deleteById(id);

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DerivacionResponseDTO> listarPorCita(Long idCita) {

        if (!citaRepository.existsById(idCita)) {
            throw new ResourceNotFoundException(
                    "Cita no encontrada");
        }

        return derivacionRepository.findByCitaIdCita(idCita)
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    private DerivacionResponseDTO convertirResponse(
            Derivacion derivacion) {

        return new DerivacionResponseDTO(
                derivacion.getIdDerivacion(),
                derivacion.getFecha(),
                derivacion.getMotivo(),
                derivacion.getCentroDestino(),
                derivacion.getResponsable(),
                derivacion.getEstado(),
                derivacion.getCita().getIdCita()
        );
    }
}