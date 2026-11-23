
package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.upeu.centromedico.centro_medico.dto.CitaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.CitaResponseDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.MedicoProductividadDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.ReprogramarCitaDTO;
import pe.edu.upeu.centromedico.centro_medico.enums.Rol;
import pe.edu.upeu.centromedico.centro_medico.security.UsuarioPrincipal;
import pe.edu.upeu.centromedico.centro_medico.services.ICitaService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/citas")
public class CitaController {

    private final ICitaService citaService;

    @PersistenceContext
    private EntityManager entityManager;

    public CitaController(ICitaService citaService) {
        this.citaService = citaService;
    }

    // ==========================================
    // MIS CITAS - MEDICO AUTENTICADO
    // ==========================================

    @GetMapping("/mis-citas")
    public ResponseEntity<List<CitaResponseDTO>> misCitas(
            @AuthenticationPrincipal UsuarioPrincipal principal
    ) {

        if (principal == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debe iniciar sesión."
            );
        }

        if (principal.usuario().getRol() != Rol.MEDICO) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta consulta es exclusiva para médicos."
            );
        }

        if (principal.usuario().getPersona() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "El usuario no tiene una persona asociada."
            );
        }

        Long idPersona =
                principal.usuario().getPersona().getIdPersona();

        // Localizar el registro MEDICO vinculado
        // a la PERSONA del usuario autenticado.
        List<Long> medicos = entityManager.createQuery(
                        "SELECT m.idEmpleado " +
                                "FROM Medico m " +
                                "WHERE m.empleado.persona.idPersona = :idPersona",
                        Long.class
                )
                .setParameter("idPersona", idPersona)
                .setMaxResults(1)
                .getResultList();

        if (medicos.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "El trabajador no tiene un registro médico asociado."
            );
        }

        Long idMedico = medicos.get(0);

        return ResponseEntity.ok(
                citaService.listarPorMedico(idMedico)
        );
    }

    // ==========================================
    // LISTAR TODAS LAS CITAS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<CitaResponseDTO>> listar() {

        return ResponseEntity.ok(
                citaService.listarTodo()
        );
    }

    // ==========================================
    // BUSCAR CITA POR ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<CitaResponseDTO> obtener(
            @PathVariable Long id
    ) {

        return citaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // LISTAR CITAS POR PACIENTE
    // ==========================================

    @GetMapping("/paciente/{idPersona}")
    public ResponseEntity<List<CitaResponseDTO>> listarPorPaciente(
            @PathVariable Long idPersona
    ) {

        return ResponseEntity.ok(
                citaService.listarPorPaciente(idPersona)
        );
    }

    // ==========================================
    // HISTORIAL DE PACIENTES
    // ==========================================

    @GetMapping("/historial-pacientes")
    public ResponseEntity<List<CitaResponseDTO>> listarUltimasPorPaciente() {

        return ResponseEntity.ok(
                citaService.listarUltimasPorPaciente()
        );
    }

    // ==========================================
    // ALERTAS DE TRIAJE
    // ==========================================

    @GetMapping("/alertas-triaje")
    public ResponseEntity<List<CitaResponseDTO>> listarCitasCriticas(
            @RequestParam(required = false) BigDecimal temp,
            @RequestParam(required = false) BigDecimal presion
    ) {

        return ResponseEntity.ok(
                citaService.listarCitasCriticas(temp, presion)
        );
    }

    // ==========================================
    // PRODUCTIVIDAD MEDICA
    // ==========================================

    @GetMapping("/productividad-medicos")
    public ResponseEntity<List<MedicoProductividadDTO>>
    obtenerProductividadMedicos() {

        return ResponseEntity.ok(
                citaService.obtenerProductividadMedicos()
        );
    }

    // ==========================================
    // DISPONIBILIDAD PUBLICA DEL MEDICO
    // ==========================================

    public record HorarioOcupado(
            String fechaCita,
            String horaCita,
            String estado
    ) {}

    @GetMapping("/ocupadas/medico/{idMedico}")
    public ResponseEntity<List<HorarioOcupado>> obtenerHorasOcupadas(
            @PathVariable Long idMedico
    ) {

        LocalDate hoy = LocalDate.now(
                ZoneId.of("America/Lima")
        );

        LocalDate limite = hoy.plusDays(28);

        List<Object[]> registros = entityManager.createQuery(
                        "SELECT c.fechaCita, c.horaCita, c.estado " +
                                "FROM Cita c " +
                                "WHERE c.medico.idEmpleado = :idMedico " +
                                "AND c.fechaCita >= :hoy " +
                                "AND c.fechaCita < :limite",
                        Object[].class
                )
                .setParameter("idMedico", idMedico)
                .setParameter("hoy", hoy)
                .setParameter("limite", limite)
                .getResultList();

        List<HorarioOcupado> ocupadas = new ArrayList<>();

        for (Object[] registro : registros) {

            if (registro[0] == null || registro[1] == null) {
                continue;
            }

            String estado = registro[2] == null
                    ? ""
                    : registro[2].toString()
                    .trim()
                    .toUpperCase(Locale.ROOT);

            if (estado.equals("ANULADO") ||
                    estado.equals("ANULADA") ||
                    estado.equals("CANCELADO") ||
                    estado.equals("CANCELADA")) {
                continue;
            }

            ocupadas.add(new HorarioOcupado(
                    registro[0].toString(),
                    registro[1].toString(),
                    "OCUPADA"
            ));
        }

        return ResponseEntity.ok(ocupadas);
    }

    // ==========================================
    // LISTAR CITAS POR MEDICO
    // ==========================================

    @GetMapping("/medico/{idMedico}")
    public ResponseEntity<List<CitaResponseDTO>> listarPorMedico(
            @PathVariable Long idMedico
    ) {

        return ResponseEntity.ok(
                citaService.listarPorMedico(idMedico)
        );
    }

    // ==========================================
    // REGISTRAR CITA
    // ==========================================

    @PostMapping
    public ResponseEntity<CitaResponseDTO> crear(
            @Valid @RequestBody CitaDTO dto
    ) {

        return new ResponseEntity<>(
                citaService.crear(dto),
                HttpStatus.CREATED
        );
    }

    // ==========================================
    // ACTUALIZAR CITA
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<CitaResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CitaDTO dto
    ) {

        return citaService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // ANULAR CITA
    // ==========================================

    @PatchMapping("/{id}/anular")
    public ResponseEntity<Void> anular(
            @PathVariable Long id
    ) {

        if (citaService.anular(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // REPROGRAMAR CITA
    // ==========================================

    @PatchMapping("/{id}/reprogramar")
    public ResponseEntity<CitaResponseDTO> reprogramar(
            @PathVariable Long id,
            @Valid @RequestBody ReprogramarCitaDTO dto
    ) {

        return citaService.reprogramar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
