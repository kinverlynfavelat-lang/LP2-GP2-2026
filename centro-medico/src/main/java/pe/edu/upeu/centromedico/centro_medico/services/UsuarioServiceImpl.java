
package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.upeu.centromedico.centro_medico.dto.RegistroUsuarioDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Persona;
import pe.edu.upeu.centromedico.centro_medico.entity.Usuario;
import pe.edu.upeu.centromedico.centro_medico.enums.Rol;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPersona;
import pe.edu.upeu.centromedico.centro_medico.exceptions.DuplicateResourceExeption;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;
import pe.edu.upeu.centromedico.centro_medico.repository.PersonaRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.UsuarioRepository;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    private final PersonaRepository personaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(
            PersonaRepository personaRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.personaRepository = personaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public Map<String, Object> registrarTrabajador(
            RegistroUsuarioDTO dto
    ) {

        // 1. Verificar que el usuario no exista
        if (usuarioRepository.findByUsuario(dto.usuario()).isPresent()) {
            throw new DuplicateResourceExeption(
                    "El usuario '" + dto.usuario() + "' ya existe."
            );
        }

        // 2. Permitir solamente roles de trabajadores
        Set<Rol> rolesPermitidos = Set.of(
                Rol.ADMIN,
                Rol.TRIAJE,
                Rol.MEDICO,
                Rol.FARMACIA
        );

        if (!rolesPermitidos.contains(dto.rol())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El rol indicado no corresponde a un trabajador."
            );
        }

        // 3. Buscar o crear la persona
        Persona persona = obtenerOCrearPersona(dto);

        // 4. Verificar que no tenga usuario asignado
        if (usuarioRepository.existsByPersonaIdPersona(
                persona.getIdPersona()
        )) {
            throw new DuplicateResourceExeption(
                    "Esta persona ya tiene un usuario registrado."
            );
        }

        // 5. Crear usuario
        Usuario nuevo = new Usuario();

        nuevo.setUsuario(dto.usuario().trim());

        // CONTRASENA PROTEGIDA CON BCRYPT
        nuevo.setPassword(
                passwordEncoder.encode(dto.password())
        );

        nuevo.setRol(dto.rol());
        nuevo.setPersona(persona);

        // 6. Guardar usuario
        Usuario guardado = usuarioRepository.save(nuevo);

        // 7. Preparar respuesta sin exponer la contraseña
        Map<String, Object> respuesta = new LinkedHashMap<>();

        respuesta.put("idUsuario", guardado.getIdUsuario());
        respuesta.put("usuario", guardado.getUsuario());
        respuesta.put("rol", guardado.getRol().name());
        respuesta.put("idPersona", persona.getIdPersona());
        respuesta.put(
                "mensaje",
                "Trabajador registrado correctamente"
        );

        return respuesta;
    }

    // ==========================================
    // BUSCAR O CREAR PERSONA
    // ==========================================

    private Persona obtenerOCrearPersona(RegistroUsuarioDTO dto) {

        Persona persona;

        // CASO 1: PERSONA EXISTENTE POR ID
        if (dto.idPersona() != null) {

            persona = personaRepository.findById(dto.idPersona())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Persona no encontrada con ID: "
                                            + dto.idPersona()
                            )
                    );

        } else {

            // CASO 2: BUSCAR PERSONA POR DNI
            persona = personaRepository.findByDni(dto.dni())
                    .orElse(null);

            // CASO 3: CREAR PERSONA NUEVA
            if (persona == null) {

                persona = new Persona();

                persona.setDni(dto.dni().trim());
                persona.setNombres(dto.nombres().trim());
                persona.setApellidos(dto.apellidos().trim());
                persona.setCorreo(dto.correo());
                persona.setTelefono(dto.telefono());
                persona.setDireccion(dto.direccion());

                // SOLO REGISTRAMOS TRABAJADORES
                persona.setTipoPersona(TipoPersona.EMPLEADO);

                // LOS DATOS DE PACIENTE NO APLICAN
                persona.setTipoPaciente(null);

                persona = personaRepository.save(persona);
            }
        }

        // Confirmar que pertenece al personal del centro medico
        if (persona.getTipoPersona() != TipoPersona.EMPLEADO) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La persona debe estar registrada como EMPLEADO."
            );
        }

        return persona;
    }
}
