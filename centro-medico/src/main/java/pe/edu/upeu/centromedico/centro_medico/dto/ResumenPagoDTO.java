package pe.edu.upeu.centromedico.centro_medico.dto;

import pe.edu.upeu.centromedico.centro_medico.enums.MedioPago;

import java.math.BigDecimal;

public record ResumenPagoDTO(
        MedioPago medioPago,
        Long cantidadTransacciones,
        BigDecimal totalRecaudado
) {
}
