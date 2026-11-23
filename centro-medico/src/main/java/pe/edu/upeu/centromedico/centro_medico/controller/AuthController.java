
package pe.edu.upeu.centromedico.centro_medico.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import pe.edu.upeu.centromedico.centro_medico.dto.AuthResponse;
import pe.edu.upeu.centromedico.centro_medico.dto.LoginRequest;
import pe.edu.upeu.centromedico.centro_medico.dto.RegistroUsuarioDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Usuario;
import pe.edu.upeu.centromedico.centro_medico.repository.UsuarioRepository;
import pe.edu.upeu.centromedico.centro_medico.security.JwtService;
import pe.edu.upeu.centromedico.centro_medico.security.UsuarioPrincipal;
import pe.edu.upeu.centromedico.centro_medico.services.IUsuarioService;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final IUsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(
            IUsuarioService usuarioService,
            AuthenticationManager authenticationManager,
            UsuarioRepository usuarioRepository,
            JwtService jwtService
    ) {
        this.usuarioService = usuarioService;
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    // ==========================================
    // REGISTRO DE TRABAJADORES
    // SOLO ADMINISTRADOR
    // ==========================================

    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registrar(
            @Valid @RequestBody RegistroUsuarioDTO dto
    ) {

        Map<String, Object> respuesta =
                usuarioService.registrarTrabajador(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(respuesta);
    }

    // ==========================================
    // LOGIN DE TRABAJADORES
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        // Verificar usuario y contraseña con Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.usuario(),
                        request.password()
                )
        );

        // Obtener usuario autenticado
        Usuario user = usuarioRepository
                .findByUsuario(request.usuario())
                .orElseThrow();

        // Generar token JWT
        String jwtToken = jwtService.generateToken(
                new UsuarioPrincipal(user)
        );

        Long idPersona = user.getPersona() != null
                ? user.getPersona().getIdPersona()
                : null;

        // Respuesta del login
        return ResponseEntity.ok(
                new AuthResponse(
                        jwtToken,
                        user.getUsuario(),
                        user.getRol().name(),
                        user.getIdUsuario(),
                        idPersona
                )
        );
    }
}
