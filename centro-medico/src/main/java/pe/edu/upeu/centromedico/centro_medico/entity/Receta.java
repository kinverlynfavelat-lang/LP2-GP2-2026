
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "RECETA")
public class Receta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_receta")
    private Long idReceta;

    @ManyToOne
    @JoinColumn(name = "id_cita")
    private Cita cita;

    @Column(name = "fecha_emision")
    private LocalDate fechaEmision;

    @OneToMany(mappedBy = "receta")
    private List<DetalleReceta> detalles;

    public Receta() {
    }

    public Receta(Long idReceta, Cita cita, LocalDate fechaEmision, List<DetalleReceta> detalles) {
        this.idReceta = idReceta;
        this.cita = cita;
        this.fechaEmision = fechaEmision;
        this.detalles = detalles;
    }

    public Long getIdReceta() {
        return idReceta;
    }

    public void setIdReceta(Long idReceta) {
        this.idReceta = idReceta;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    public LocalDate getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDate fechaEmision) {
        this.fechaEmision = fechaEmision;
    }

    public List<DetalleReceta> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleReceta> detalles) {
        this.detalles = detalles;
    }
}
