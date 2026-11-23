
package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.upeu.centromedico.centro_medico.dto.FondoEstudiantilDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.PersonaDTO;
import pe.edu.upeu.centromedico.centro_medico.services.IPersonaService;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/personas")
public class PersonaController {

    private final IPersonaService personaService;

    public PersonaController(IPersonaService personaService) {
        this.personaService = personaService;
    }

    // ==========================================
    // LISTAR TODAS LAS PERSONAS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<PersonaDTO>> listar() {

        return ResponseEntity.ok(
                personaService.listarTodo()
        );
    }

    // ==========================================
    // BUSCAR PERSONA POR ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<PersonaDTO> obtener(
            @PathVariable Long id) {

        return personaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // BUSCAR PERSONA POR DNI
    // ==========================================

    @GetMapping("/dni/{dni}")
    public ResponseEntity<PersonaDTO> buscarPorDni(
            @PathVariable String dni) {

        return personaService.buscarPorDni(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // BUSCAR POR CODIGO UNIVERSITARIO
    // CONSULTA ADMINISTRATIVA
    // ==========================================

    @GetMapping("/codigo/{codigoUniversitario}")
    public ResponseEntity<PersonaDTO> buscarPorCodigo(
            @PathVariable String codigoUniversitario) {

        return personaService.buscarPorCodigo(codigoUniversitario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // BUSCAR PACIENTE POR CODIGO UNIVERSITARIO
    // RESPUESTA LIMITADA PARA EL PORTAL
    // ==========================================

    @GetMapping("/portal/codigo/{codigoUniversitario}")
    public ResponseEntity<Map<String, Object>> buscarPacientePortalPorCodigo(
            @PathVariable String codigoUniversitario) {

        Optional<PersonaDTO> resultado =
                personaService.buscarPorCodigo(codigoUniversitario);

        if (resultado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        PersonaDTO persona = resultado.get();

        Map<String, Object> datos = new LinkedHashMap<>();

        // PersonaDTO es un record, por eso
        // utilizamos sus metodos de acceso
        // sin el prefijo "get".

        datos.put("idPersona", persona.idPersona());
        datos.put("nombres", persona.nombres());
        datos.put("apellidos", persona.apellidos());
        datos.put("tipoPaciente", persona.tipoPaciente());
        datos.put(
                "codigoUniversitario",
                persona.codigoUniversitario()
        );

        return ResponseEntity.ok(datos);
    }

    // ==========================================
    // CREAR PERSONA
    // ==========================================

    @PostMapping
    public ResponseEntity<PersonaDTO> crear(
            @Valid @RequestBody PersonaDTO dto) {

        return new ResponseEntity<>(
                personaService.crear(dto),
                HttpStatus.CREATED
        );
    }

    // ==========================================
    // ACTUALIZAR PERSONA
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<PersonaDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PersonaDTO dto) {

        return personaService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // ELIMINAR PERSONA
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        if (personaService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // RF-03: CONSULTAR FONDO ESTUDIANTIL
    // ==========================================

    @GetMapping("/fondo/{codigoUniversitario}")
    public ResponseEntity<FondoEstudiantilDTO> consultarFondo(
            @PathVariable String codigoUniversitario) {

        return personaService.consultarFondo(codigoUniversitario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
