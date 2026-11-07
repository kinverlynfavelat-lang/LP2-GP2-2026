package pe.edu.upeu.centromedico.centro_medico.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record RecetaDTO(

        @NotNull(message = "La cita es obligatoria")
        Long idCita,

        @NotEmpty(message = "La receta debe contener al menos un medicamento")
        List<@Valid DetalleRecetaDTO> detalles

) {
}