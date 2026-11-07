package pe.edu.upeu.centromedico.centro_medico.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.NotNull;
import pe.edu.upeu.centromedico.centro_medico.enums.MedioPago;

import java.time.LocalDate;

public record PagoDTO(

        @Parameter(hidden = true)
        Long idCita,

        LocalDate fecha,

        String motivoPago,

        java.math.BigDecimal monto,

        MedioPago medioPago

) {
}