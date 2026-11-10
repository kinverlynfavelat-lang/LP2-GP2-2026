
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.Medicamento;

import java.util.List;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
    // QUERY: Medicamentos con stock crítico o bajo
    @Query("SELECT m FROM Medicamento m WHERE m.stock <= :stockLimite ORDER BY m.stock ASC")
    List<Medicamento> findMedicamentosStockCritico(@Param("stockLimite") Integer stockLimite);

}
