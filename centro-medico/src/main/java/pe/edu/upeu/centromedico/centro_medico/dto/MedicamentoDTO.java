
package pe.edu.upeu.centromedico.centro_medico.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.*;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoMedicamento;

import java.math.BigDecimal;

public record MedicamentoDTO(

        @Parameter(hidden = true)
        Long idMedicamento,

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        String descripcion,

        @NotNull(message = "El stock es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stock,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
        BigDecimal precio,

        @NotNull(message = "El estado es obligatorio")
        EstadoMedicamento estado

) {
}
