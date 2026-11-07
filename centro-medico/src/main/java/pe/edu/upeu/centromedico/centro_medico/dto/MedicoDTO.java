package pe.edu.upeu.centromedico.centro_medico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MedicoDTO(

        @NotNull(message = "El empleado es obligatorio")
        Long idEmpleado,

        @NotBlank(message = "La especialidad es obligatoria")
        String especialidad,

        @NotBlank(message = "El código de colegiatura es obligatorio")
        String codigoCol

) {
}