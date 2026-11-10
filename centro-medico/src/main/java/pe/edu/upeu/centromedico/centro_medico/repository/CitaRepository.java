
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    @Query("SELECT c FROM Cita c WHERE c.idCita IN (" +
            "    SELECT MAX(c2.idCita) FROM Cita c2 WHERE c2.persona IS NOT NULL GROUP BY c2.persona.idPersona" +
            ") ORDER BY c.fechaCita DESC, c.horaCita DESC")
    List<Cita> findUltimasCitasPorPaciente();
}
