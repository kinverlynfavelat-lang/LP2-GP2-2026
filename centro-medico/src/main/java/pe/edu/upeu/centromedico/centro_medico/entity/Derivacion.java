
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoDerivacion;

import java.time.LocalDate;
@Entity
@Table(name = "DERIVACION")
public class Derivacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_derivacion")
    private Long idDerivacion;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "motivo", length = 200)
    private String motivo;

    @Column(name = "centro_destino", length = 100)
    private String centroDestino;

    @Column(name = "responsable", length = 100)
    private String responsable;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 30)
    private EstadoDerivacion estado;

    @ManyToOne
    @JoinColumn(name = "id_cita")
    private Cita cita;

    public Derivacion() {
    }

    public Derivacion(Long idDerivacion, LocalDate fecha, String motivo, String centroDestino, String responsable, EstadoDerivacion estado, Cita cita) {
        this.idDerivacion = idDerivacion;
        this.fecha = fecha;
        this.motivo = motivo;
        this.centroDestino = centroDestino;
        this.responsable = responsable;
        this.estado = estado;
        this.cita = cita;
    }

    public Long getIdDerivacion() {
        return idDerivacion;
    }

    public void setIdDerivacion(Long idDerivacion) {
        this.idDerivacion = idDerivacion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getCentroDestino() {
        return centroDestino;
    }

    public void setCentroDestino(String centroDestino) {
        this.centroDestino = centroDestino;
    }

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }

    public EstadoDerivacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoDerivacion estado) {
        this.estado = estado;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }
}
