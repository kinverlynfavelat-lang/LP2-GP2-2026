
package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.PersonaDTO;
import pe.edu.upeu.centromedico.centro_medico.services.IPersonaService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/personas")
public class PersonaController {

    private final IPersonaService personaService;

    public PersonaController(IPersonaService personaService) {
        this.personaService = personaService;
    }

    @GetMapping
    public ResponseEntity<List<PersonaDTO>> listar() {

        return ResponseEntity.ok(
                personaService.listarTodo()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonaDTO> obtener(
            @PathVariable Long id) {

        return personaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<PersonaDTO> buscarPorDni(
            @PathVariable String dni) {

        return personaService.buscarPorDni(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigoUniversitario}")
    public ResponseEntity<PersonaDTO> buscarPorCodigo(
            @PathVariable String codigoUniversitario) {

        return personaService.buscarPorCodigo(codigoUniversitario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PersonaDTO> crear(
            @Valid @RequestBody PersonaDTO dto) {

        return new ResponseEntity<>(
                personaService.crear(dto),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonaDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PersonaDTO dto) {

        return personaService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        if (personaService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
}
