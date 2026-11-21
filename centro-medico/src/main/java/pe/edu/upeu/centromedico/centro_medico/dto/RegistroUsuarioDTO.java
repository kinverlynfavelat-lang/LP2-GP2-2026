package pe.edu.upeu.centromedico.centro_medico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.edu.upeu.centromedico.centro_medico.enums.Rol;

public record RegistroUsuarioDTO(
        @NotBlank(message = "El nombre de usuario es obligatorio")
        String usuario,
        @NotBlank(message = "La contraseña es obligatoria")
        String password,
        @NotNull(message = "El rol es obligatorio")
        Rol rol,
        Long idPersona
) {
}
