
package pe.edu.upeu.centromedico.centro_medico.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.upeu.centromedico.centro_medico.dto.ReporteDTO;
import pe.edu.upeu.centromedico.centro_medico.services.IReporteService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
public class ReporteController {

    private final IReporteService reporteService;

    public ReporteController(IReporteService reporteService) {
        this.reporteService = reporteService;
    }

    // ============================================
    // RF-25: REPORTE DIARIO
    // ============================================

    @GetMapping("/diario")
    public ResponseEntity<List<ReporteDTO>> obtenerReporteDiario(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fecha) {

        return ResponseEntity.ok(
                reporteService.obtenerReporteDiario(fecha)
        );
    }

    // ============================================
    // RF-25: REPORTE SEMANAL
    // ============================================

    @GetMapping("/semanal")
    public ResponseEntity<List<ReporteDTO>> obtenerReporteSemanal(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fecha) {

        return ResponseEntity.ok(
                reporteService.obtenerReporteSemanal(fecha)
        );
    }

    // ============================================
    // RF-25: REPORTE MENSUAL
    // ============================================

    @GetMapping("/mensual")
    public ResponseEntity<List<ReporteDTO>> obtenerReporteMensual(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fecha) {

        return ResponseEntity.ok(
                reporteService.obtenerReporteMensual(fecha)
        );
    }
}
