
package pe.edu.upeu.centromedico.centro_medico.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.edu.upeu.centromedico.centro_medico.enums.Rol;

public record UsuarioDTO(

        @Parameter(hidden = true)
        Long idUsuario,

        @NotBlank(message = "El usuario es obligatorio")
        String usuario,

        @NotBlank(message = "La contraseña es obligatoria")
        String password,

        @NotNull(message = "El rol es obligatorio")
        Rol rol

) {
}
