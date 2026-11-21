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
import pe.edu.upeu.centromedico.centro_medico.entity.Usuario;
import pe.edu.upeu.centromedico.centro_medico.exceptions.DuplicateResourceExeption;
import pe.edu.upeu.centromedico.centro_medico.repository.UsuarioRepository;
import pe.edu.upeu.centromedico.centro_medico.security.JwtService;
import pe.edu.upeu.centromedico.centro_medico.security.UsuarioPrincipal;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            AuthenticationManager authenticationManager,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
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

        return ResponseEntity.ok(new AuthResponse(
                jwtToken,
                user.getUsuario(),
                user.getRol().name(),
                user.getIdUsuario()
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

        Usuario guardado = usuarioRepository.save(nuevo);

        return new ResponseEntity<>(
                Map.of(
                        "idUsuario", guardado.getIdUsuario(),
                        "usuario", guardado.getUsuario(),
                        "rol", guardado.getRol().name(),
                        "mensaje", "Usuario registrado correctamente"
                ),
                HttpStatus.CREATED
        );
    }
}
