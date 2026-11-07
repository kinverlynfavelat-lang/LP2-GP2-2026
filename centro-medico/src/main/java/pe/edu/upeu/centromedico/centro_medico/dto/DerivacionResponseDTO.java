package pe.edu.upeu.centromedico.centro_medico.dto;

import pe.edu.upeu.centromedico.centro_medico.enums.EstadoDerivacion;

import java.time.LocalDate;

public record DerivacionResponseDTO(

        Long idDerivacion,
        LocalDate fecha,
        String motivo,
        String centroDestino,
        String responsable,
        EstadoDerivacion estado,
        Long idCita

) {
}