
package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.EmpleadoDTO;

import java.util.List;
import java.util.Optional;

public interface IEmpleadoService {

    List<EmpleadoDTO> listarTodo();

    Optional<EmpleadoDTO> buscarPorId(Long id);

    EmpleadoDTO crear(EmpleadoDTO dto);

    Optional<EmpleadoDTO> actualizar(Long id, EmpleadoDTO dto);

}
