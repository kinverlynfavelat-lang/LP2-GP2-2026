
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;
import pe.edu.upeu.centromedico.centro_medico.enums.DiaSemana;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoHorario;
@Entity
@Table(name = "HORARIO_MEDICO")
public class HorarioMedico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario")
    private Long idHorario;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", length = 15)
    private DiaSemana diaSemana;

    @Column(name = "hora_inicio", length = 5)
    private String horaInicio;

    @Column(name = "hora_fin", length = 5)
    private String horaFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private EstadoHorario estado;

    @ManyToOne
    @JoinColumn(name = "id_medico")
    private Medico medico;

    public HorarioMedico() {
    }

    public HorarioMedico(Long idHorario, DiaSemana diaSemana, String horaInicio, String horaFin, EstadoHorario estado, Medico medico) {
        this.idHorario = idHorario;
        this.diaSemana = diaSemana;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.estado = estado;
        this.medico = medico;
    }

    public Long getIdHorario() {
        return idHorario;
    }

    public void setIdHorario(Long idHorario) {
        this.idHorario = idHorario;
    }

    public DiaSemana getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(DiaSemana diaSemana) {
        this.diaSemana = diaSemana;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public String getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }

    public EstadoHorario getEstado() {
        return estado;
    }

    public void setEstado(EstadoHorario estado) {
        this.estado = estado;
    }

    public Medico getMedico() {
        return medico;
    }

    public void setMedico(Medico medico) {
        this.medico = medico;
    }
}
