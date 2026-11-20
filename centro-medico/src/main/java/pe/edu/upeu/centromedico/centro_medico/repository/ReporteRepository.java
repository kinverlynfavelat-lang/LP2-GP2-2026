
package pe.edu.upeu.centromedico.centro_medico.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.centromedico.centro_medico.entity.Cita;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReporteRepository
        extends org.springframework.data.repository.Repository<Cita, Long> {

    // RF-25: REPORTE DIARIO DE ATENCIONES

    @Query(value = """
            SELECT FECHA,
                   MEDICO,
                   ESPECIALIDAD,
                   TIPO_PACIENTE,
                   CANT_ATENCIONES,
                   PORCENTAJE
            FROM US_CENTRO.V_REPORTE_DIARIO
            WHERE FECHA = :fecha
            ORDER BY MEDICO
            """, nativeQuery = true)
    List<Object[]> obtenerReporteDiario(
            @Param("fecha") LocalDate fecha
    );


    // RF-25: REPORTE SEMANAL DE ATENCIONES

    @Query(value = """
            SELECT INICIO_SEMANA,
                   FIN_SEMANA,
                   FECHA_ATENCION,
                   MEDICO,
                   ESPECIALIDAD,
                   TIPO_PACIENTE,
                   CANT_ATENCIONES,
                   PORCENTAJE
            FROM US_CENTRO.V_REPORTE_SEMANAL
            WHERE INICIO_SEMANA = TRUNC(:fecha, 'IW')
            ORDER BY FECHA_ATENCION, MEDICO
            """, nativeQuery = true)
    List<Object[]> obtenerReporteSemanal(
            @Param("fecha") LocalDate fecha
    );


    // RF-25: REPORTE MENSUAL DE ATENCIONES

    @Query(value = """
            SELECT MES,
                   FECHA_ATENCION,
                   MEDICO,
                   ESPECIALIDAD,
                   TIPO_PACIENTE,
                   CANT_ATENCIONES,
                   PORCENTAJE
            FROM US_CENTRO.V_REPORTE_MENSUAL
            WHERE MES = TRUNC(:fecha, 'MM')
            ORDER BY FECHA_ATENCION, MEDICO
            """, nativeQuery = true)
    List<Object[]> obtenerReporteMensual(
            @Param("fecha") LocalDate fecha
    );

}
