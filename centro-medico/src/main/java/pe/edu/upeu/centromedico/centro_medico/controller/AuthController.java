package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.centromedico.centro_medico.dto.AuthResponse;
import pe.edu.upeu.centromedico.centro_medico.dto.LoginRequest;
import pe.edu.upeu.centromedico.centro_medico.dto.RegistroUsuarioDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Persona;
import pe.edu.upeu.centromedico.centro_medico.entity.Usuario;
import pe.edu.upeu.centromedico.centro_medico.exceptions.DuplicateResourceExeption;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;
import pe.edu.upeu.centromedico.centro_medico.repository.PersonaRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.UsuarioRepository;
import pe.edu.upeu.centromedico.centro_medico.security.JwtService;
import pe.edu.upeu.centromedico.centro_medico.security.UsuarioPrincipal;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            AuthenticationManager authenticationManager,
            UsuarioRepository usuarioRepository,
            PersonaRepository personaRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.usuario(), request.password())
        );

        Usuario user = usuarioRepository.findByUsuario(request.usuario()).orElseThrow();
        String jwtToken = jwtService.generateToken(new UsuarioPrincipal(user));
        Long idPersona = user.getPersona() != null ? user.getPersona().getIdPersona() : null;

        return ResponseEntity.ok(new AuthResponse(
                jwtToken,
                user.getUsuario(),
                user.getRol().name(),
                user.getIdUsuario(),
                idPersona
        ));
    }

    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registrar(@Valid @RequestBody RegistroUsuarioDTO dto) {
        if (usuarioRepository.findByUsuario(dto.usuario()).isPresent()) {
            throw new DuplicateResourceExeption("El usuario '" + dto.usuario() + "' ya existe.");
        }

        Usuario nuevo = new Usuario();
        nuevo.setUsuario(dto.usuario());
        nuevo.setPassword(passwordEncoder.encode(dto.password()));
        nuevo.setRol(dto.rol());

        if (dto.idPersona() != null) {
            if (usuarioRepository.existsByPersonaIdPersona(dto.idPersona())) {
                throw new DuplicateResourceExeption("La persona con Id " + dto.idPersona() + " ya tiene un usuario asignado.");
            }
            Persona persona = personaRepository.findById(dto.idPersona())
                    .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada con Id: " + dto.idPersona()));
            nuevo.setPersona(persona);
        }

        Usuario guardado = usuarioRepository.save(nuevo);

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("idUsuario", guardado.getIdUsuario());
        respuesta.put("usuario", guardado.getUsuario());
        respuesta.put("rol", guardado.getRol().name());
        respuesta.put("idPersona", guardado.getPersona() != null ? guardado.getPersona().getIdPersona() : null);
        respuesta.put("mensaje", "Usuario registrado correctamente");

        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }
}
