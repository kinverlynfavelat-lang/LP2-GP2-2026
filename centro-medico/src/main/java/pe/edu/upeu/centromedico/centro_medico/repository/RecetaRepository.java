
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.Receta;

import java.util.List;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, Long> {

    List<Receta> findByCitaIdCita(Long idCita);

}
