
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
@Entity
@Table(name = "DETALLE_MEDICAMENTO")
public class DetalleMedicamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_medicamento")
    private Long idDetalleMedicamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_detalle_receta", nullable = false)
    private DetalleReceta detalleReceta;

    @Column(name = "cantidad_entregada")
    private Integer cantidadEntregada;

    @Column(name = "fecha_salida")
    private LocalDate fechaSalida;

    public DetalleMedicamento() {
    }

    public DetalleMedicamento(
            Long idDetalleMedicamento,
            DetalleReceta detalleReceta,
            Integer cantidadEntregada,
            LocalDate fechaSalida) {

        this.idDetalleMedicamento = idDetalleMedicamento;
        this.detalleReceta = detalleReceta;
        this.cantidadEntregada = cantidadEntregada;
        this.fechaSalida = fechaSalida;
    }

    public Long getIdDetalleMedicamento() {
        return idDetalleMedicamento;
    }

    public void setIdDetalleMedicamento(Long idDetalleMedicamento) {
        this.idDetalleMedicamento = idDetalleMedicamento;
    }

    public DetalleReceta getDetalleReceta() {
        return detalleReceta;
    }

    public void setDetalleReceta(DetalleReceta detalleReceta) {
        this.detalleReceta = detalleReceta;
    }

    public Integer getCantidadEntregada() {
        return cantidadEntregada;
    }

    public void setCantidadEntregada(Integer cantidadEntregada) {
        this.cantidadEntregada = cantidadEntregada;
    }

    public LocalDate getFechaSalida() {
        return fechaSalida;
    }

    public void setFechaSalida(LocalDate fechaSalida) {
        this.fechaSalida = fechaSalida;
    }
}
