
package pe.edu.upeu.centromedico.centro_medico.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReprogramarCitaDTO(

        @NotNull
        LocalDate fechaCita,

        @NotBlank
        String horaCita

) {}
