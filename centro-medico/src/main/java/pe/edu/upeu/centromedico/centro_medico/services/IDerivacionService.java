package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.DerivacionDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.DerivacionResponseDTO;

import java.util.List;
import java.util.Optional;

public interface IDerivacionService {

    List<DerivacionResponseDTO> listarTodo();

    Optional<DerivacionResponseDTO> buscarPorId(Long id);

    DerivacionResponseDTO crear(DerivacionDTO dto);

    Optional<DerivacionResponseDTO> actualizar(
            Long id,
            DerivacionDTO dto
    );

    boolean eliminar(Long id);

    List<DerivacionResponseDTO> listarPorCita(Long idCita);
}