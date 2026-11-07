
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoCita;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
@Entity
@Table(name = "CITA")
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Long idCita;

    @Column(name = "fecha_cita")
    private LocalDate fechaCita;

    @Column(name = "hora_cita", length = 5)
    private String horaCita;

    @Column(name = "notificacion", length = 1)
    private String notificacion;

    @Column(name = "temperatura", precision = 4, scale = 1)
    private BigDecimal temperatura;

    @Column(name = "presion", precision = 4, scale = 1)
    private BigDecimal presion;

    @Column(name = "frecuencia_cardiaca", precision = 4, scale = 1)
    private BigDecimal frecuenciaCardiaca;

    @Column(name = "frecuencia_respiratoria", precision = 4, scale = 1)
    private BigDecimal frecuenciaRespiratoria;

    @Column(name = "peso", precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(name = "talla", precision = 5, scale = 2)
    private BigDecimal talla;

    @Column(name = "motivo_consulta", length = 100)
    private String motivoConsulta;

    @Column(name = "diagnostico", length = 200)
    private String diagnostico;

    @Column(name = "tratamiento", length = 200)
    private String tratamiento;

    @Column(name = "observaciones", length = 200)
    private String observaciones;

    @Column(name = "indicaciones", length = 200)
    private String indicaciones;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 30)
    private EstadoCita estado;

    @ManyToOne
    @JoinColumn(name = "id_medico")
    private Medico medico;

    @ManyToOne
    @JoinColumn(name = "id_persona")
    private Persona persona;

    @ManyToOne
    @JoinColumn(name = "id_empleado")
    private Empleado empleado;

    @OneToOne(mappedBy = "cita")
    private Pago pago;

    @OneToMany(mappedBy = "cita")
    private List<Derivacion> derivaciones;

    @OneToMany(mappedBy = "cita")
    private List<Receta> recetas;

    public Cita() {
    }

    public Cita(Long idCita, LocalDate fechaCita, String horaCita, String notificacion, BigDecimal temperatura, BigDecimal presion, BigDecimal frecuenciaCardiaca, BigDecimal frecuenciaRespiratoria, BigDecimal peso, BigDecimal talla, String motivoConsulta, String diagnostico, String tratamiento, String observaciones, String indicaciones, EstadoCita estado, Medico medico, Persona persona, Empleado empleado, Pago pago, List<Derivacion> derivaciones, List<Receta> recetas) {
        this.idCita = idCita;
        this.fechaCita = fechaCita;
        this.horaCita = horaCita;
        this.notificacion = notificacion;
        this.temperatura = temperatura;
        this.presion = presion;
        this.frecuenciaCardiaca = frecuenciaCardiaca;
        this.frecuenciaRespiratoria = frecuenciaRespiratoria;
        this.peso = peso;
        this.talla = talla;
        this.motivoConsulta = motivoConsulta;
        this.diagnostico = diagnostico;
        this.tratamiento = tratamiento;
        this.observaciones = observaciones;
        this.indicaciones = indicaciones;
        this.estado = estado;
        this.medico = medico;
        this.persona = persona;
        this.empleado = empleado;
        this.pago = pago;
        this.derivaciones = derivaciones;
        this.recetas = recetas;
    }

    public Long getIdCita() {
        return idCita;
    }

    public void setIdCita(Long idCita) {
        this.idCita = idCita;
    }

    public LocalDate getFechaCita() {
        return fechaCita;
    }

    public void setFechaCita(LocalDate fechaCita) {
        this.fechaCita = fechaCita;
    }

    public String getNotificacion() {

        return notificacion;
    }

    public void setNotificacion(String notificacion) {
        this.notificacion = notificacion;
    }

    public BigDecimal getTemperatura() {
        return temperatura;
    }

    public void setTemperatura(BigDecimal temperatura) {
        this.temperatura = temperatura;
    }

    public BigDecimal getPresion() {
        return presion;
    }

    public void setPresion(BigDecimal presion) {
        this.presion = presion;
    }

    public BigDecimal getFrecuenciaCardiaca() {
        return frecuenciaCardiaca;
    }

    public void setFrecuenciaCardiaca(BigDecimal frecuenciaCardiaca) {
        this.frecuenciaCardiaca = frecuenciaCardiaca;
    }

    public BigDecimal getFrecuenciaRespiratoria() {
        return frecuenciaRespiratoria;
    }

    public void setFrecuenciaRespiratoria(BigDecimal frecuenciaRespiratoria) {
        this.frecuenciaRespiratoria = frecuenciaRespiratoria;
    }

    public BigDecimal getPeso() {
        return peso;
    }

    public void setPeso(BigDecimal peso) {
        this.peso = peso;
    }

    public BigDecimal getTalla() {
        return talla;
    }

    public void setTalla(BigDecimal talla) {
        this.talla = talla;
    }

    public String getMotivoConsulta() {
        return motivoConsulta;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getTratamiento() {
        return tratamiento;
    }

    public void setTratamiento(String tratamiento) {
        this.tratamiento = tratamiento;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getIndicaciones() {
        return indicaciones;
    }

    public void setIndicaciones(String indicaciones) {
        this.indicaciones = indicaciones;
    }

    public EstadoCita getEstado() {
        return estado;
    }

    public void setEstado(EstadoCita estado) {
        this.estado = estado;
    }

    public Medico getMedico() {
        return medico;
    }

    public void setMedico(Medico medico) {
        this.medico = medico;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }

    public List<Derivacion> getDerivaciones() {
        return derivaciones;
    }

    public void setDerivaciones(List<Derivacion> derivaciones) {
        this.derivaciones = derivaciones;
    }

    public List<Receta> getRecetas() {
        return recetas;
    }

    public void setRecetas(List<Receta> recetas) {
        this.recetas = recetas;
    }

    public String getHoraCita() {
        return horaCita;
    }

    public void setHoraCita(String horaCita) {
        this.horaCita = horaCita;
    }
}
