
package pe.edu.upeu.centromedico.centro_medico.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReporteDTO(

        LocalDate fecha,
        LocalDate inicioSemana,
        LocalDate finSemana,
        LocalDate fechaAtencion,
        LocalDate mes,

        String medico,
        String especialidad,
        String tipoPaciente,

        Long cantAtenciones,
        BigDecimal porcentaje

) {

    @JsonProperty("periodo")
    public String periodo() {

        if (mes != null) {
            DateTimeFormatter formato =
                    DateTimeFormatter.ofPattern(
                            "MMMM 'de' yyyy",
                            Locale.forLanguageTag("es-PE")
                    );

            return formato.format(mes);
        }

        if (inicioSemana != null && finSemana != null) {
            DateTimeFormatter formato =
                    DateTimeFormatter.ofPattern("dd/MM/yyyy");

            return "Del " + inicioSemana.format(formato)
                    + " al " + finSemana.format(formato);
        }

        if (fecha != null) {
            return fecha.format(
                    DateTimeFormatter.ofPattern("dd/MM/yyyy")
            );
        }

        return null;
    }
}
