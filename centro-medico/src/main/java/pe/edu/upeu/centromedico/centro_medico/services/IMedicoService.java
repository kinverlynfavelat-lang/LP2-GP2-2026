
package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.MedicoDTO;

import java.util.List;
import java.util.Optional;

public interface IMedicoService {

    List<MedicoDTO> listarTodo();

    Optional<MedicoDTO> buscarPorId(Long id);

    MedicoDTO crear(MedicoDTO dto);

    Optional<MedicoDTO> actualizar(Long id, MedicoDTO dto);

}
