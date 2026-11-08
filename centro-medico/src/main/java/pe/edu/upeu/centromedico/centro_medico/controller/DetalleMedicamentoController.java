
package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.upeu.centromedico.centro_medico.dto.DetalleMedicamentoDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.DetalleMedicamentoResponseDTO;

import pe.edu.upeu.centromedico.centro_medico.services.IDetalleMedicamentoService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/detalle-medicamentos")
public class DetalleMedicamentoController {

    private final IDetalleMedicamentoService detalleMedicamentoService;

    public DetalleMedicamentoController(
            IDetalleMedicamentoService detalleMedicamentoService) {

        this.detalleMedicamentoService = detalleMedicamentoService;
    }

    // ==========================
    // LISTAR TODAS LAS SALIDAS
    // ==========================

    @GetMapping
    public ResponseEntity<List<DetalleMedicamentoResponseDTO>> listar() {

        return ResponseEntity.ok(
                detalleMedicamentoService.listarTodo()
        );
    }

    // ==========================
    // BUSCAR SALIDA POR ID
    // ==========================

    @GetMapping("/{id}")
    public ResponseEntity<DetalleMedicamentoResponseDTO> obtener(
            @PathVariable Long id) {

        return detalleMedicamentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================
    // REGISTRAR ENTREGA
    // ==========================

    @PostMapping
    public ResponseEntity<DetalleMedicamentoResponseDTO> registrar(
            @Valid @RequestBody DetalleMedicamentoDTO dto) {

        return new ResponseEntity<>(
                detalleMedicamentoService.registrarEntrega(dto),
                HttpStatus.CREATED
        );
    }

    // ==========================
    // LISTAR POR DETALLE DE RECETA
    // ==========================

    @GetMapping("/receta/{idDetalleReceta}")
    public ResponseEntity<List<DetalleMedicamentoResponseDTO>> listarPorDetalleReceta(
            @PathVariable Long idDetalleReceta) {

        return ResponseEntity.ok(
                detalleMedicamentoService.listarPorDetalleReceta(
                        idDetalleReceta
                )
        );
    }

    // ==========================
    // LISTAR SALIDAS POR FECHA
    // ==========================

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<DetalleMedicamentoResponseDTO>> listarPorFecha(
            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fecha) {

        return ResponseEntity.ok(
                detalleMedicamentoService.listarPorFecha(fecha)
        );
    }

    // ==========================
    // LISTAR SALIDAS POR PERIODO
    // ==========================

    @GetMapping("/periodo")
    public ResponseEntity<List<DetalleMedicamentoResponseDTO>> listarPorPeriodo(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fechaInicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fechaFin) {

        return ResponseEntity.ok(
                detalleMedicamentoService.listarPorPeriodo(
                        fechaInicio,
                        fechaFin
                )
        );
    }

}
