
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.Medicamento;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
}
