
package pe.edu.upeu.centromedico.centro_medico.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.*;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoCita;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CitaDTO(

        @Parameter(hidden = true)
                Long idCita,

        LocalDate fechaCita,

        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
                message = "La hora debe tener formato HH:mm")
        String horaCita,

        @Pattern(regexp = "S|N",
                message = "La notificación debe ser S o N")
        String notificacion,

        @DecimalMin("0.0")
        BigDecimal temperatura,

        @DecimalMin("0.0")
        BigDecimal presion,

        @DecimalMin("0.0")
        BigDecimal frecuenciaCardiaca,

        @DecimalMin("0.0")
        BigDecimal frecuenciaRespiratoria,

        @DecimalMin("0.0")
        BigDecimal peso,

        @DecimalMin("0.0")
        BigDecimal talla,

        String motivoConsulta,

        String diagnostico,

        String tratamiento,

        String observaciones,

        String indicaciones,

        EstadoCita estado,

        Long idMedico,

        Long idPersona,

        Long idEmpleado

) {}