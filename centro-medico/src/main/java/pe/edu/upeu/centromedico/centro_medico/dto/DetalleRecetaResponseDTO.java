package pe.edu.upeu.centromedico.centro_medico.dto;

public record DetalleRecetaResponseDTO(

        Long idDetalleReceta,
        Long idMedicamento,
        String medicamento,
        String dosis,
        String indicaciones,
        Integer cantidad

) {
}