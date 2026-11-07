
package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.MedicoDTO;
import pe.edu.upeu.centromedico.centro_medico.services.IMedicoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medicos")
public class MedicoController {

    private final IMedicoService medicoService;

    public MedicoController(IMedicoService medicoService) {
        this.medicoService = medicoService;
    }

    @GetMapping
    public ResponseEntity<List<MedicoDTO>> listarMedicos() {

        return ResponseEntity.ok(
                medicoService.listarTodo()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicoDTO> obtenerMedicoPorId(
            @PathVariable Long id) {

        return medicoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MedicoDTO> crearMedico(
            @Valid @RequestBody MedicoDTO dto) {

        return new ResponseEntity<>(
                medicoService.crear(dto),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicoDTO> actualizarMedico(
            @PathVariable Long id,
            @Valid @RequestBody MedicoDTO dto) {

        return medicoService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
