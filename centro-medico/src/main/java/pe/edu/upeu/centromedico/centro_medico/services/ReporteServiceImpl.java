
package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.centromedico.centro_medico.dto.ReporteDTO;
import pe.edu.upeu.centromedico.centro_medico.repository.ReporteRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class ReporteServiceImpl implements IReporteService {

    private final ReporteRepository reporteRepository;

    public ReporteServiceImpl(ReporteRepository reporteRepository) {
        this.reporteRepository = reporteRepository;
    }

    // ============================================
    // RF-25: REPORTE DIARIO
    // ============================================

    @Override
    @Transactional(readOnly = true)
    public List<ReporteDTO> obtenerReporteDiario(LocalDate fecha) {

        return reporteRepository.obtenerReporteDiario(fecha)
                .stream()
                .map(fila -> new ReporteDTO(
                        convertirFecha(fila[0]),
                        null,
                        null,
                        null,
                        null,
                        (String) fila[1],
                        (String) fila[2],
                        (String) fila[3],
                        convertirLong(fila[4]),
                        convertirDecimal(fila[5])
                ))
                .toList();
    }

    // ============================================
    // RF-25: REPORTE SEMANAL
    // ============================================

    @Override
    @Transactional(readOnly = true)
    public List<ReporteDTO> obtenerReporteSemanal(LocalDate fecha) {

        return reporteRepository.obtenerReporteSemanal(fecha)
                .stream()
                .map(fila -> new ReporteDTO(
                        null,
                        convertirFecha(fila[0]),
                        convertirFecha(fila[1]),
                        convertirFecha(fila[2]),
                        null,
                        (String) fila[3],
                        (String) fila[4],
                        (String) fila[5],
                        convertirLong(fila[6]),
                        convertirDecimal(fila[7])
                ))
                .toList();
    }

    // ============================================
    // RF-25: REPORTE MENSUAL
    // ============================================

    @Override
    @Transactional(readOnly = true)
    public List<ReporteDTO> obtenerReporteMensual(LocalDate fecha) {

        return reporteRepository.obtenerReporteMensual(fecha)
                .stream()
                .map(fila -> new ReporteDTO(
                        null,
                        null,
                        null,
                        convertirFecha(fila[1]),
                        convertirFecha(fila[0]),
                        (String) fila[2],
                        (String) fila[3],
                        (String) fila[4],
                        convertirLong(fila[5]),
                        convertirDecimal(fila[6])
                ))
                .toList();
    }

    // ============================================
    // CONVERSIONES DE DATOS DE ORACLE
    // ============================================

    private LocalDate convertirFecha(Object valor) {

        if (valor == null) {
            return null;
        }

        if (valor instanceof LocalDate fecha) {
            return fecha;
        }

        if (valor instanceof java.sql.Timestamp fecha) {
            return fecha.toLocalDateTime().toLocalDate();
        }

        if (valor instanceof java.sql.Date fecha) {
            return fecha.toLocalDate();
        }

        if (valor instanceof java.util.Date fecha) {
            return fecha.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
        }

        throw new IllegalArgumentException(
                "Tipo de fecha no soportado: " + valor.getClass()
        );
    }

    private Long convertirLong(Object valor) {
        return valor == null ? 0L : ((Number) valor).longValue();
    }

    private BigDecimal convertirDecimal(Object valor) {
        return valor == null
                ? BigDecimal.ZERO
                : new BigDecimal(valor.toString());
    }
}
