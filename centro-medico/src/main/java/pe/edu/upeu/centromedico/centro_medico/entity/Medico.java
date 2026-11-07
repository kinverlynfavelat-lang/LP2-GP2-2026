
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;

import java.util.List;
@Entity
@Table(name = "MEDICO")
public class Medico {
    @Id
    @Column(name = "id_empleado")
    private Long idEmpleado;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_empleado")
    private Empleado empleado;

    @Column(name = "especialidad", length = 100)
    private String especialidad;

    @Column(name = "codigo_col", length = 100)
    private String codigoCol;

    @OneToMany(mappedBy = "medico")
    private List<HorarioMedico> horarios;

    public Medico() {
    }

    public Medico(Long idEmpleado, Empleado empleado, String especialidad, String codigoCol, List<HorarioMedico> horarios) {
        this.idEmpleado = idEmpleado;
        this.empleado = empleado;
        this.especialidad = especialidad;
        this.codigoCol = codigoCol;
        this.horarios = horarios;
    }

    public Long getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Long idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public String getCodigoCol() {
        return codigoCol;
    }

    public void setCodigoCol(String codigoCol) {
        this.codigoCol = codigoCol;
    }

    public List<HorarioMedico> getHorarios() {
        return horarios;
    }

    public void setHorarios(List<HorarioMedico> horarios) {
        this.horarios = horarios;
    }
}
