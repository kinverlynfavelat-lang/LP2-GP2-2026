
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.DetalleReceta;

import java.util.List;

@Repository
public interface DetalleRecetaRepository extends JpaRepository<DetalleReceta, Long> {

    List<DetalleReceta> findByRecetaIdReceta(Long idReceta);

}
