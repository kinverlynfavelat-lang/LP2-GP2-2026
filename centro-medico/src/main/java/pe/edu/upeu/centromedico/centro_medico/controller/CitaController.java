package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.upeu.centromedico.centro_medico.dto.CitaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.CitaResponseDTO;

import pe.edu.upeu.centromedico.centro_medico.dto.MedicoProductividadDTO;
import pe.edu.upeu.centromedico.centro_medico.services.ICitaService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/citas")
public class CitaController {

    private final ICitaService citaService;

    public CitaController(ICitaService citaService) {
        this.citaService = citaService;
    }

    // ==========================
    // LISTAR CITAS
    // ==========================

    @GetMapping
    public ResponseEntity<List<CitaResponseDTO>> listar() {

        return ResponseEntity.ok(
                citaService.listarTodo()
        );
    }

    // ==========================
    // BUSCAR CITA POR ID
    // ==========================

    @GetMapping("/{id}")
    public ResponseEntity<CitaResponseDTO> obtener(
            @PathVariable Long id) {

        return citaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================
    // LISTAR CITAS POR PACIENTE
    // ==========================

    @GetMapping("/paciente/{idPersona}")
    public ResponseEntity<List<CitaResponseDTO>> listarPorPaciente(
            @PathVariable Long idPersona) {

        return ResponseEntity.ok(
                citaService.listarPorPaciente(idPersona)
        );
    }

    // ========================================================
    // HISTORIAL DE PACIENTES: ÚLTIMA CITA DE CADA PACIENTE
    // ========================================================

    @GetMapping("/historial-pacientes")
    public ResponseEntity<List<CitaResponseDTO>> listarUltimasPorPaciente() {

        return ResponseEntity.ok(
                citaService.listarUltimasPorPaciente()
        );
    }

    // ============================================
    // TRIAJE ALERTAS DE SIGNOS VITALES CRÍTICOS
    // ============================================

    @GetMapping("/alertas-triaje")
    public ResponseEntity<List<CitaResponseDTO>> listarCitasCriticas(
            @RequestParam(required = false) BigDecimal temp,
            @RequestParam(required = false) BigDecimal presion) {

        return ResponseEntity.ok(
                citaService.listarCitasCriticas(temp, presion)
        );
    }

    // =================================================
    // PRODUCTIVIDAD MÉDICA: TOTAL DE CITAS POR MÉDICO
    // =================================================

    @GetMapping("/productividad-medicos")
    public ResponseEntity<List<MedicoProductividadDTO>> obtenerProductividadMedicos() {

        return ResponseEntity.ok(
                citaService.obtenerProductividadMedicos()
        );
    }

    // ==========================
    // LISTAR CITAS POR MEDICO
    // ==========================

    @GetMapping("/medico/{idMedico}")
    public ResponseEntity<List<CitaResponseDTO>> listarPorMedico(
            @PathVariable Long idMedico) {

        return ResponseEntity.ok(
                citaService.listarPorMedico(idMedico)
        );
    }

    // ==========================
    // REGISTRAR CITA
    // ==========================

    @PostMapping
    public ResponseEntity<CitaResponseDTO> crear(
            @Valid @RequestBody CitaDTO dto) {

        return new ResponseEntity<>(
                citaService.crear(dto),
                HttpStatus.CREATED
        );
    }

    // ==========================
    // ACTUALIZAR CITA
    // ==========================

    @PutMapping("/{id}")
    public ResponseEntity<CitaResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CitaDTO dto) {

        return citaService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================
    // ANULAR CITA
    // ==========================

    @PatchMapping("/{id}/anular")
    public ResponseEntity<Void> anular(
            @PathVariable Long id) {

        if (citaService.anular(id)) {

            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

}