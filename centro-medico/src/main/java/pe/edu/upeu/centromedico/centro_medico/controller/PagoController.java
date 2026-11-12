package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.PagoDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.ResumenPagoDTO;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;
import pe.edu.upeu.centromedico.centro_medico.services.IPagoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pagos")
public class PagoController {

    private final IPagoService pagoService;

    public PagoController(IPagoService pagoService) {
        this.pagoService = pagoService;
    }

    @GetMapping
    public ResponseEntity<List<PagoDTO>> listarPagos() {

        return ResponseEntity.ok(
                pagoService.listarTodo()
        );
    }

    // =====================================================
    // CAJA / PAGOS REPORTE DE INGRESOS POR MEDIO DE PAGO
    // =====================================================

    @GetMapping("/resumen-medio-pago")
    public ResponseEntity<List<ResumenPagoDTO>> obtenerResumenPorMedioPago() {

        return ResponseEntity.ok(
                pagoService.obtenerResumenPorMedioPago()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoDTO> obtenerPago(
            @PathVariable Long id) {

        return pagoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pago no encontrado con Id: " + id));
    }

    @PostMapping
    public ResponseEntity<String> registrarPago(
            @Valid @RequestBody PagoDTO dto) {

        return new ResponseEntity<>(
                pagoService.registrarPago(dto),
                HttpStatus.CREATED
        );
    }
}