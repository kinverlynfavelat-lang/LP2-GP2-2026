
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoMedicamento;

import java.math.BigDecimal;
@Entity
@Table(name = "MEDICAMENTO")
public class Medicamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medicamento")
    private Long idMedicamento;

    @Column(name = "nombre", length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 100)
    private String descripcion;

    @Column(name = "stock")
    private Integer stock;

    @Column(name = "precio", precision = 6, scale = 2)
    private BigDecimal precio;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 20)
    private EstadoMedicamento estado;

    public Medicamento() {
    }

    public Medicamento(Long idMedicamento, String nombre, String descripcion, Integer stock, BigDecimal precio, EstadoMedicamento estado) {
        this.idMedicamento = idMedicamento;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.stock = stock;
        this.precio = precio;
        this.estado = estado;
    }

    public Long getIdMedicamento() {
        return idMedicamento;
    }

    public void setIdMedicamento(Long idMedicamento) {
        this.idMedicamento = idMedicamento;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public EstadoMedicamento getEstado() {
        return estado;
    }

    public void setEstado(EstadoMedicamento estado) {
        this.estado = estado;
    }
}
