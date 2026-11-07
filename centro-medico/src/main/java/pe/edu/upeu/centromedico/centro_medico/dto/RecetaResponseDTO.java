package pe.edu.upeu.centromedico.centro_medico.dto;

import java.time.LocalDate;
import java.util.List;

public record RecetaResponseDTO(

        Long idReceta,
        Long idCita,
        LocalDate fechaEmision,
        String paciente,
        Integer edad,
        String diagnostico,
        String tratamiento,
        List<DetalleRecetaResponseDTO> detalles

) {
}