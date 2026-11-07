
package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.HorarioMedicoDTO;

import java.util.List;
import java.util.Optional;

public interface IHorarioMedicoService {

    List<HorarioMedicoDTO> listarPorMedico(Long idMedico);

    Optional<HorarioMedicoDTO> buscarPorId(Long id);

    HorarioMedicoDTO crear(HorarioMedicoDTO dto);

    Optional<HorarioMedicoDTO> actualizar(
            Long id,
            HorarioMedicoDTO dto
    );
}
