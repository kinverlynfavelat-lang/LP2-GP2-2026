
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.dto.ResumenPagoDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Pago;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    // QUERY (CAJA / PAGOS): Reporte de ingresos por medio de pago

    @Query("SELECT new pe.edu.upeu.centromedico.centro_medico.dto.ResumenPagoDTO(" +
            "  p.medioPago, " +
            "  COUNT(p.idCita), " +
            "  SUM(p.monto)" +
            ") " +
            "FROM Pago p " +
            "GROUP BY p.medioPago " +
            "ORDER BY SUM(p.monto) DESC")
    List<ResumenPagoDTO> obtenerResumenPorMedioPago();
}
