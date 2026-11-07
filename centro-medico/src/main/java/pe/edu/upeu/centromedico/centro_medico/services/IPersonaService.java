
package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.PersonaDTO;

import java.util.List;
import java.util.Optional;

public interface IPersonaService {

    List<PersonaDTO> listarTodo();

    Optional<PersonaDTO> buscarPorId(Long id);

    Optional<PersonaDTO> buscarPorDni(String dni);

    Optional<PersonaDTO> buscarPorCodigo(String codigoUniversitario);

    PersonaDTO crear(PersonaDTO p);

    Optional<PersonaDTO> actualizar(Long id, PersonaDTO p);

    boolean eliminar(Long id);
}
