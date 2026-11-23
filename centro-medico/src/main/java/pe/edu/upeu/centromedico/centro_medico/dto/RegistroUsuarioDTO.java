package pe.edu.upeu.centromedico.centro_medico.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import pe.edu.upeu.centromedico.centro_medico.enums.Rol;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPersona;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPaciente;

public record RegistroUsuarioDTO(

        @NotBlank(message = "El nombre de usuario es obligatorio")
        String usuario,

        @NotBlank(message = "La contraseña es obligatoria")
        String password,

        @NotNull(message = "El rol es obligatorio")
        Rol rol,

        // Si la persona ya existe en Oracle
        Long idPersona,

        // Datos para crear una persona nueva
        String dni,
        String nombres,
        String apellidos,
        String correo,
        String telefono,
        String direccion,

        TipoPersona tipoPersona,
        TipoPaciente tipoPaciente

) {

    @AssertTrue(message = "Debe indicar un idPersona existente o completar DNI, nombres y apellidos")
    public boolean isDatosPersonaValidos() {

        if (idPersona != null) {
            return true;
        }

        return tieneTexto(dni)
                && tieneTexto(nombres)
                && tieneTexto(apellidos);
    }

    private static boolean tieneTexto(String valor) {
        return valor != null && !valor.isBlank();
    }
}