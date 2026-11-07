
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.Derivacion;

import java.util.List;

@Repository
public interface DerivacionRepository extends JpaRepository<Derivacion, Long> {

    List<Derivacion> findByCitaIdCita(Long idCita);

}
