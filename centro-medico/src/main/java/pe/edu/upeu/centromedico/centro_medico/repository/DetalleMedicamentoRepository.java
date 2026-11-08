
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.DetalleMedicamento;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DetalleMedicamentoRepository extends JpaRepository<DetalleMedicamento, Long> {

    // Listar entregas por detalle de receta
    List<DetalleMedicamento> findByDetalleReceta_IdDetalleReceta(Long idDetalleReceta);

    // Listar salidas por fecha
    List<DetalleMedicamento> findByFechaSalida(LocalDate fechaSalida);

    // Listar salidas entre dos fechas
    List<DetalleMedicamento> findByFechaSalidaBetween(
            LocalDate fechaInicio,
            LocalDate fechaFin
    );

}
