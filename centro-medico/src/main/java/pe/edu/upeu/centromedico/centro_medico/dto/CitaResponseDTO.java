package pe.edu.upeu.centromedico.centro_medico.dto;

import pe.edu.upeu.centromedico.centro_medico.enums.EstadoCita;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CitaResponseDTO(

        Long idCita,
        LocalDate fechaCita,
        String horaCita,
        String notificacion,
        BigDecimal temperatura,
        BigDecimal presion,
        BigDecimal frecuenciaCardiaca,
        BigDecimal frecuenciaRespiratoria,
        BigDecimal peso,
        BigDecimal talla,
        String motivoConsulta,
        String diagnostico,
        String tratamiento,
        String observaciones,
        String indicaciones,
        EstadoCita estado,
        String paciente,
        String medico,
        String empleadoTriaje,
        Long idPersona,
        String dniPaciente

) {
}