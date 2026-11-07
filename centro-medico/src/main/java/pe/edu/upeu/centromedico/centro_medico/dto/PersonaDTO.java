
package pe.edu.upeu.centromedico.centro_medico.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.*;
import pe.edu.upeu.centromedico.centro_medico.enums.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PersonaDTO(

        @Parameter(hidden = true)
        Long idPersona,

        @NotBlank(message = "El DNI es obligatorio")
        @Pattern(regexp = "\\d{8}", message = "El DNI debe tener 8 dígitos")
        String dni,

        @NotBlank(message = "Los nombres son obligatorios")
        @Size(max = 20, message = "Los nombres no deben superar 20 caracteres")
        String nombres,

        @NotBlank(message = "Los apellidos son obligatorios")
        @Size(max = 20, message = "Los apellidos no deben superar 20 caracteres")
        String apellidos,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es válido")
        String correo,

        @NotBlank(message = "El teléfono es obligatorio")
        String telefono,

        String direccion,

        @NotNull(message = "La fecha de nacimiento es obligatoria")
        @Past(message = "La fecha de nacimiento debe ser anterior a hoy")
        LocalDate fechaNacimiento,

        @NotNull(message = "El estado civil es obligatorio")
        EstadoCivil estadoCivil,

        String alergias,

        @NotNull(message = "El tipo de persona es obligatorio")
        TipoPersona tipoPersona,

        TipoPaciente tipoPaciente,

        String codigoUniversitario,

        @DecimalMin(value = "0.00", message = "El saldo no puede ser negativo")
        BigDecimal saldoFondo,

        SiNo matriculaVigente,

        EstadoPersona estado,

        Long idUsuario

) {

    @AssertTrue(message = "Debe indicar el tipo de paciente cuando la persona es PACIENTE o AMBOS")
    public boolean isTipoPacienteValido() {
        if (tipoPersona == null) {
            return true;
        }

        if (tipoPersona == TipoPersona.EMPLEADO) {
            return tipoPaciente == null;
        }

        return tipoPaciente != null;
    }

    @AssertTrue(message = "El código universitario es obligatorio para estudiantes")
    public boolean isCodigoUniversitarioValido() {
        if (tipoPaciente == TipoPaciente.ESTUDIANTE) {
            return codigoUniversitario != null
                    && !codigoUniversitario.isBlank();
        }

        return true;
    }

    @AssertTrue(message = "Debe indicar la matrícula vigente del estudiante")
    public boolean isMatriculaVigenteValida() {
        if (tipoPaciente == TipoPaciente.ESTUDIANTE) {
            return matriculaVigente != null;
        }

        return true;
    }

    @AssertTrue(message = "Los pacientes externos no deben tener datos universitarios")
    public boolean isDatosExternoValidos() {
        if (tipoPaciente == TipoPaciente.EXTERNO) {
            return (codigoUniversitario == null
                    || codigoUniversitario.isBlank())
                    && matriculaVigente == null
                    && saldoFondo == null;
        }

        return true;
    }

    @AssertTrue(message = "Los empleados que no son pacientes no deben tener datos de paciente")
    public boolean isDatosEmpleadoValidos() {
        if (tipoPersona == TipoPersona.EMPLEADO) {
            return tipoPaciente == null
                    && (codigoUniversitario == null
                    || codigoUniversitario.isBlank())
                    && matriculaVigente == null
                    && saldoFondo == null;
        }

        return true;
    }

    @AssertTrue(message = "El saldo del fondo no puede superar S/200")
    public boolean isSaldoFondoValido() {
        if (saldoFondo == null) {
            return true;
        }

        return saldoFondo.compareTo(new BigDecimal("200.00")) <= 0;
    }
}
