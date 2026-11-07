
package pe.edu.upeu.centromedico.centro_medico.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.edu.upeu.centromedico.centro_medico.enums.DiaSemana;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoHorario;

public record HorarioMedicoDTO(

        @Parameter(hidden = true)
        Long idHorario,

        @NotNull(message = "El día de la semana es obligatorio")
        DiaSemana diaSemana,

        @NotBlank(message = "La hora de inicio es obligatoria")
        String horaInicio,

        @NotBlank(message = "La hora de fin es obligatoria")
        String horaFin,

        @NotNull(message = "El estado es obligatorio")
        EstadoHorario estado,

        @NotNull(message = "El médico es obligatorio")
        Long idMedico

) {
}
