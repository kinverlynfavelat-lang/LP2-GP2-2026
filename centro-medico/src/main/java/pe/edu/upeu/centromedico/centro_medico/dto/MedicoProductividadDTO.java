package pe.edu.upeu.centromedico.centro_medico.dto;

public record MedicoProductividadDTO(
        Long idMedico,
        String nombreMedico,
        String especialidad,
        Long totalCitas
) {
}
