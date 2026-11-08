
package pe.edu.upeu.centromedico.centro_medico.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DetalleMedicamentoDTO(

        @NotNull(message = "El detalle de receta es obligatorio")
        Long idDetalleReceta,

        @NotNull(message = "La cantidad entregada es obligatoria")
        @Min(value = 1, message = "La cantidad entregada debe ser mayor a cero")
        Integer cantidadEntregada

) {
}
