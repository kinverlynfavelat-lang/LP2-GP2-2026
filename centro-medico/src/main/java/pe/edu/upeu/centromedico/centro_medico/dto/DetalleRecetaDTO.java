package pe.edu.upeu.centromedico.centro_medico.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DetalleRecetaDTO(

        @NotNull(message = "El medicamento es obligatorio")
        Long idMedicamento,

        @NotBlank(message = "La dosis es obligatoria")
        String dosis,

        @NotBlank(message = "Las indicaciones son obligatorias")
        String indicaciones,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser mayor a cero")
        Integer cantidad

) {
}