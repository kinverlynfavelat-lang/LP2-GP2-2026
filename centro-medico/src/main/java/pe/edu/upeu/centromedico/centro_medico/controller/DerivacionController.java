package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.DerivacionDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.DerivacionResponseDTO;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;
import pe.edu.upeu.centromedico.centro_medico.services.IDerivacionService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/derivaciones")
public class DerivacionController {

    private final IDerivacionService derivacionService;

    public DerivacionController(
            IDerivacionService derivacionService) {

        this.derivacionService = derivacionService;
    }

    @GetMapping
    public ResponseEntity<List<DerivacionResponseDTO>> listar() {

        return ResponseEntity.ok(
                derivacionService.listarTodo()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DerivacionResponseDTO> obtener(
            @PathVariable Long id) {

        return derivacionService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Derivación no encontrada con Id: " + id));
    }

    @PostMapping
    public ResponseEntity<DerivacionResponseDTO> crear(
            @Valid @RequestBody DerivacionDTO dto) {

        return new ResponseEntity<>(
                derivacionService.crear(dto),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<DerivacionResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody DerivacionDTO dto) {

        return derivacionService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No se logró actualizar la derivación con Id: " + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        if (derivacionService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }

        throw new ResourceNotFoundException(
                "No se pudo eliminar la derivación con Id: " + id);
    }

    @GetMapping("/cita/{idCita}")
    public ResponseEntity<List<DerivacionResponseDTO>> listarPorCita(
            @PathVariable Long idCita) {

        return ResponseEntity.ok(
                derivacionService.listarPorCita(idCita)
        );
    }
}