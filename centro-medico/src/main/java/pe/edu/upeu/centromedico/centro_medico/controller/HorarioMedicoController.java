
package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.HorarioMedicoDTO;
import pe.edu.upeu.centromedico.centro_medico.services.IHorarioMedicoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/horarios-medicos")
public class HorarioMedicoController {

    private final IHorarioMedicoService horarioMedicoService;

    public HorarioMedicoController(
            IHorarioMedicoService horarioMedicoService) {

        this.horarioMedicoService = horarioMedicoService;
    }

    @GetMapping("/medico/{idMedico}")
    public ResponseEntity<List<HorarioMedicoDTO>> listarPorMedico(
            @PathVariable Long idMedico) {

        return ResponseEntity.ok(
                horarioMedicoService.listarPorMedico(idMedico)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<HorarioMedicoDTO> obtenerPorId(
            @PathVariable Long id) {

        return horarioMedicoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<HorarioMedicoDTO> crear(
            @Valid @RequestBody HorarioMedicoDTO dto) {

        return new ResponseEntity<>(
                horarioMedicoService.crear(dto),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<HorarioMedicoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody HorarioMedicoDTO dto) {

        return horarioMedicoService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
