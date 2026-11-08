
package pe.edu.upeu.centromedico.centro_medico.dto;

import java.time.LocalDate;

public record DetalleMedicamentoResponseDTO(

        Long idDetalleMedicamento,
        Long idDetalleReceta,
        Long idMedicamento,
        String nombreMedicamento,
        Integer cantidadPrescrita,
        Integer cantidadEntregada,
        LocalDate fechaSalida,
        Long idReceta,
        Long idCita,
        Long idPersona,
        String paciente

) {
}
