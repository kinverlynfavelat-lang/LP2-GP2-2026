package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.RecetaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.RecetaResponseDTO;

import java.util.List;
import java.util.Optional;

public interface IRecetaService {

    List<RecetaResponseDTO> listarTodo();

    Optional<RecetaResponseDTO> buscarPorId(Long id);

    RecetaResponseDTO crear(RecetaDTO dto);

    Optional<RecetaResponseDTO> actualizar(Long id, RecetaDTO dto);

    boolean eliminar(Long id);
}