
package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.ReporteDTO;

import java.time.LocalDate;
import java.util.List;

public interface IReporteService {

    List<ReporteDTO> obtenerReporteDiario(LocalDate fecha);

    List<ReporteDTO> obtenerReporteSemanal(LocalDate fecha);

    List<ReporteDTO> obtenerReporteMensual(LocalDate fecha);
}
