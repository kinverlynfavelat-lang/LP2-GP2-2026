
package pe.edu.upeu.centromedico.centro_medico.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EmpleadoDTO(

        @Parameter(hidden = true)
        Long idPersona,

        @NotNull(message = "La fecha de ingreso es obligatoria")
        @PastOrPresent(message = "La fecha de ingreso no puede ser futura")
        LocalDate fechaIngreso,

        @NotNull(message = "El sueldo es obligatorio")
        @DecimalMin(value = "0.01", message = "El sueldo debe ser mayor que cero")
        BigDecimal sueldo

) {
}
