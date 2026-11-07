
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;
import pe.edu.upeu.centromedico.centro_medico.enums.MedioPago;

import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
@Table(name = "PAGO")
public class Pago {
    @Id
    @Column(name = "id_cita")
    private Long idCita;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_cita")
    private Cita cita;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "motivo_pago", length = 100)
    private String motivoPago;

    @Column(name = "monto", precision = 6, scale = 2)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    @Column(name = "medio_pago", length = 50)
    private MedioPago medioPago;

    public Pago() {
    }

    public Pago(Long idCita, Cita cita, LocalDate fecha, String motivoPago, BigDecimal monto, MedioPago medioPago) {
        this.idCita = idCita;
        this.cita = cita;
        this.fecha = fecha;
        this.motivoPago = motivoPago;
        this.monto = monto;
        this.medioPago = medioPago;
    }

    public Long getIdCita() {
        return idCita;
    }

    public void setIdCita(Long idCita) {
        this.idCita = idCita;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getMotivoPago() {
        return motivoPago;
    }

    public void setMotivoPago(String motivoPago) {
        this.motivoPago = motivoPago;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public MedioPago getMedioPago() {
        return medioPago;
    }

    public void setMedioPago(MedioPago medioPago) {
        this.medioPago = medioPago;
    }
}
