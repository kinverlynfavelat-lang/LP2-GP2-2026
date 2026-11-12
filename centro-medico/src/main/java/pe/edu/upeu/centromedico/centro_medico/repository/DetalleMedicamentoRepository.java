
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pe.edu.upeu.centromedico.centro_medico.entity.DetalleMedicamento;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DetalleMedicamentoRepository
        extends JpaRepository<DetalleMedicamento, Long> {

    // Listar entregas por detalle de receta
    List<DetalleMedicamento> findByDetalleReceta_IdDetalleReceta(
            Long idDetalleReceta
    );

    // ==========================================
    // REPORTE SQL: ENTREGAS POR FECHA
    // ==========================================
    @Query(value = """
            SELECT dm.*
            FROM DETALLE_MEDICAMENTO dm
            WHERE TRUNC(dm.FECHA_SALIDA) = :fechaSalida
            ORDER BY dm.FECHA_SALIDA DESC,
                     dm.ID_DETALLE_MEDICAMENTO DESC
            """, nativeQuery = true)
    List<DetalleMedicamento> findByFechaSalida(
            @Param("fechaSalida") LocalDate fechaSalida
    );

    // Listar salidas entre dos fechas
    List<DetalleMedicamento> findByFechaSalidaBetween(
            LocalDate fechaInicio,
            LocalDate fechaFin
    );

}
