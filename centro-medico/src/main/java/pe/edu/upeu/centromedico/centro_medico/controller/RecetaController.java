package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.RecetaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.RecetaResponseDTO;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;
import pe.edu.upeu.centromedico.centro_medico.services.IRecetaService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recetas")
public class RecetaController {

    private final IRecetaService recetaService;

    public RecetaController(IRecetaService recetaService) {
        this.recetaService = recetaService;
    }

    @GetMapping
    public ResponseEntity<List<RecetaResponseDTO>> listar() {

        return ResponseEntity.ok(recetaService.listarTodo());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecetaResponseDTO> obtener(
            @PathVariable Long id) {

        return recetaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Receta no encontrada con Id: " + id));
    }

    @PostMapping
    public ResponseEntity<RecetaResponseDTO> crear(
            @Valid @RequestBody RecetaDTO dto) {

        return new ResponseEntity<>(
                recetaService.crear(dto),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecetaResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody RecetaDTO dto) {

        return recetaService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No se logró actualizar la receta con Id: " + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        if (recetaService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }

        throw new ResourceNotFoundException(
                "No se pudo eliminar la receta con Id: " + id);
    }
}