package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.MedicamentoDTO;
import pe.edu.upeu.centromedico.centro_medico.services.IMedicamentoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medicamentos")
public class MedicamentoController {

    private final IMedicamentoService medicamentoService;

    public MedicamentoController(IMedicamentoService medicamentoService) {
        this.medicamentoService = medicamentoService;
    }

    @GetMapping
    public ResponseEntity<List<MedicamentoDTO>> listarMedicamentos() {

        return ResponseEntity.ok(
                medicamentoService.listarTodo()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicamentoDTO> obtenerMedicamento(
            @PathVariable Long id) {

        return medicamentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MedicamentoDTO> crearMedicamento(
            @Valid @RequestBody MedicamentoDTO dto) {

        return new ResponseEntity<>(
                medicamentoService.crear(dto),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicamentoDTO> actualizarMedicamento(
            @PathVariable Long id,
            @Valid @RequestBody MedicamentoDTO dto) {

        return medicamentoService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMedicamento(
            @PathVariable Long id) {

        if (medicamentoService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
    @PatchMapping("/{id}/ingresar-stock")
    public ResponseEntity<MedicamentoDTO> ingresarStock(
            @PathVariable Long id,
            @RequestParam Integer cantidad) {

        return medicamentoService.ingresarStock(id, cantidad)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}