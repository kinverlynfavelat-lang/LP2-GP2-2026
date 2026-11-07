
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.Cita;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoCita;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByPersonaIdPersona(Long idPersona);

    List<Cita> findByMedicoIdEmpleado(Long idMedico);

    List<Cita> findByEstado(EstadoCita estado);

    boolean existsByMedicoIdEmpleadoAndFechaCitaAndHoraCitaAndEstadoNot(
            Long idMedico,
            LocalDate fechaCita,
            String horaCita,
            EstadoCita estado
    );

}
