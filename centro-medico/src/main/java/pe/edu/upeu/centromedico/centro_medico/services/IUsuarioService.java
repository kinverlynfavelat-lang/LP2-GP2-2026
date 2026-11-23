
package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.RegistroUsuarioDTO;

import java.util.Map;

public interface IUsuarioService {

    Map<String, Object> registrarTrabajador(RegistroUsuarioDTO dto);

}
