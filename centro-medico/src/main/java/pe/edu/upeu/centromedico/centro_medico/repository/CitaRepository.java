
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.dto.MedicoProductividadDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Cita;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoCita;

import java.math.BigDecimal;
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

    // =========================================================================
    // TRIAJE: Citas con signos vitales en alerta o estado crítico
    // =========================================================================
    @Query("SELECT c FROM Cita c WHERE " +
            "(c.temperatura >= :tempLimite OR c.presion >= :presionLimite " +
            " OR c.frecuenciaCardiaca >= 120 OR (c.frecuenciaCardiaca > 0 AND c.frecuenciaCardiaca <= 50)) " +
            "ORDER BY c.fechaCita DESC, c.horaCita DESC")
    List<Cita> findCitasConSignosCriticos(
            @Param("tempLimite") BigDecimal tempLimite,
            @Param("presionLimite") BigDecimal presionLimite
    );

    // =========================================================================
    // PRODUCTIVIDAD MÉDICA: Total de citas por médico
    // =========================================================================
    @Query("SELECT new pe.edu.upeu.centromedico.centro_medico.dto.MedicoProductividadDTO(" +
            "  m.idEmpleado, " +
            "  CONCAT(p.nombres, ' ', p.apellidos), " +
            "  m.especialidad, " +
            "  COUNT(c.idCita)" +
            ") " +
            "FROM Cita c " +
            "JOIN c.medico m " +
            "JOIN m.empleado e " +
            "JOIN e.persona p " +
            "GROUP BY m.idEmpleado, p.nombres, p.apellidos, m.especialidad " +
            "ORDER BY COUNT(c.idCita) DESC")
    List<MedicoProductividadDTO> obtenerProductividadMedicos();

}
