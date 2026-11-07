
package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.EmpleadoDTO;
import pe.edu.upeu.centromedico.centro_medico.services.IEmpleadoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/empleados")
public class EmpleadoController {

    private final IEmpleadoService empleadoService;

    public EmpleadoController(IEmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @GetMapping
    public ResponseEntity<List<EmpleadoDTO>> listarEmpleados() {

        return ResponseEntity.ok(
                empleadoService.listarTodo()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpleadoDTO> obtenerPorId(
            @PathVariable Long id) {

        return empleadoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EmpleadoDTO> crearEmpleado(
            @Valid @RequestBody EmpleadoDTO dto) {

        return new ResponseEntity<>(
                empleadoService.crear(dto),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpleadoDTO> actualizarEmpleado(
            @PathVariable Long id,
            @Valid @RequestBody EmpleadoDTO dto) {

        return empleadoService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
