
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
@Table(name = "EMPLEADO")
public class Empleado {
    @Id
    @Column(name = "id_persona")
    private Long idPersona;
    @OneToOne
    @MapsId
    @JoinColumn(name = "id_persona")
    private Persona persona;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Column(name = "sueldo", precision = 6, scale = 2)
    private BigDecimal sueldo;

    @OneToOne(mappedBy = "empleado")
    private Medico medico;

    public Empleado() {
    }

    public Empleado(Long idPersona, Persona persona, LocalDate fechaIngreso, BigDecimal sueldo, Medico medico) {
        this.idPersona = idPersona;
        this.persona = persona;
        this.fechaIngreso = fechaIngreso;
        this.sueldo = sueldo;
        this.medico = medico;
    }

    public Long getIdPersona() {
        return idPersona;
    }

    public void setIdPersona(Long idPersona) {
        this.idPersona = idPersona;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    public LocalDate getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(LocalDate fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public BigDecimal getSueldo() {
        return sueldo;
    }

    public void setSueldo(BigDecimal sueldo) {
        this.sueldo = sueldo;
    }

    public Medico getMedico() {
        return medico;
    }

    public void setMedico(Medico medico) {
        this.medico = medico;
    }
}
