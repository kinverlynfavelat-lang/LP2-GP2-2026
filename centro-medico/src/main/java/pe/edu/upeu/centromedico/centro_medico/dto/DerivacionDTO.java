
package pe.edu.upeu.centromedico.centro_medico.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoDerivacion;

import java.time.LocalDate;

public record DerivacionDTO(

        @Parameter(hidden = true)
        Long idDerivacion,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        @NotBlank(message = "El motivo es obligatorio")
        String motivo,

        @NotBlank(message = "El centro de destino es obligatorio")
        String centroDestino,

        @NotBlank(message = "El responsable es obligatorio")
        String responsable,

        @NotNull(message = "El estado es obligatorio")
        EstadoDerivacion estado,

        @NotNull(message = "La cita es obligatoria")
        Long idCita

) {
}
