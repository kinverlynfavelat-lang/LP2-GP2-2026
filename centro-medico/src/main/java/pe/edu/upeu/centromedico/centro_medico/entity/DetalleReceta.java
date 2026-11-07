
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;
@Entity
@Table(name = "DETALLE_RECETA")
public class DetalleReceta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_receta")
    private Long idDetalleReceta;

    @ManyToOne
    @JoinColumn(name = "id_receta")
    private Receta receta;

    @ManyToOne
    @JoinColumn(name = "id_medicamento")
    private Medicamento medicamento;

    @Column(name = "dosis", length = 200)
    private String dosis;

    @Column(name = "indicaciones", length = 200)
    private String indicaciones;

    @Column(name = "cantidad")
    private Integer cantidad;

    public DetalleReceta() {
    }

    public DetalleReceta(Long idDetalleReceta, Receta receta, Medicamento medicamento, String dosis, String indicaciones, Integer cantidad) {
        this.idDetalleReceta = idDetalleReceta;
        this.receta = receta;
        this.medicamento = medicamento;
        this.dosis = dosis;
        this.indicaciones = indicaciones;
        this.cantidad = cantidad;
    }

    public Long getIdDetalleReceta() {
        return idDetalleReceta;
    }

    public void setIdDetalleReceta(Long idDetalleReceta) {
        this.idDetalleReceta = idDetalleReceta;
    }

    public Receta getReceta() {
        return receta;
    }

    public void setReceta(Receta receta) {
        this.receta = receta;
    }

    public Medicamento getMedicamento() {
        return medicamento;
    }

    public void setMedicamento(Medicamento medicamento) {
        this.medicamento = medicamento;
    }

    public String getDosis() {
        return dosis;
    }

    public void setDosis(String dosis) {
        this.dosis = dosis;
    }

    public String getIndicaciones() {
        return indicaciones;
    }

    public void setIndicaciones(String indicaciones) {
        this.indicaciones = indicaciones;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}
