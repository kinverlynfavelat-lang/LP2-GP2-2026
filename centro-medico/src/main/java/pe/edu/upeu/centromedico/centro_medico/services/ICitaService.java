package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.CitaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.CitaResponseDTO;

import java.util.List;
import java.util.Optional;

public interface ICitaService {

    List<CitaResponseDTO> listarTodo();

    Optional<CitaResponseDTO> buscarPorId(Long id);

    List<CitaResponseDTO> listarPorPaciente(Long idPersona);

    List<CitaResponseDTO> listarPorMedico(Long idMedico);

    CitaResponseDTO crear(CitaDTO dto);

    Optional<CitaResponseDTO> actualizar(Long id, CitaDTO dto);

    boolean anular(Long id);

}