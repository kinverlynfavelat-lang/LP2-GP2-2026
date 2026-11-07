
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.HorarioMedico;
import pe.edu.upeu.centromedico.centro_medico.enums.DiaSemana;

import java.util.List;

@Repository
public interface HorarioMedicoRepository extends JpaRepository<HorarioMedico, Long> {

    List<HorarioMedico> findByMedicoIdEmpleado(Long idEmpleado);

    List<HorarioMedico> findByMedicoIdEmpleadoAndDiaSemana(
            Long idEmpleado,
            DiaSemana diaSemana
    );

}
