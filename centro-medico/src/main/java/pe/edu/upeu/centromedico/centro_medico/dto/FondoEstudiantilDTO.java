
package pe.edu.upeu.centromedico.centro_medico.dto;

import java.math.BigDecimal;

public record FondoEstudiantilDTO(
        String codigoUniversitario,
        BigDecimal saldoDisponible,
        BigDecimal fondoMaximo,
        BigDecimal costoConsulta
) {
}
