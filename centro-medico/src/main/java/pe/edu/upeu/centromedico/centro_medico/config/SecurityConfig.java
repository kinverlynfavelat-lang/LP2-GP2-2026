
package pe.edu.upeu.centromedico.centro_medico.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import pe.edu.upeu.centromedico.centro_medico.exceptions.CustomAccessDeniedHandler;
import pe.edu.upeu.centromedico.centro_medico.exceptions.CustomAuthenticationEntryPoint;
import pe.edu.upeu.centromedico.centro_medico.security.JwtAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final AuthenticationProvider authenticationProvider;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter,
            AuthenticationProvider authenticationProvider,
            CustomAccessDeniedHandler accessDeniedHandler,
            CustomAuthenticationEntryPoint authenticationEntryPoint
    ) {
        this.jwtFilter = jwtFilter;
        this.authenticationProvider = authenticationProvider;
        this.accessDeniedHandler = accessDeniedHandler;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    // ==========================================
    // SEGURIDAD DEL CENTRO MEDICO UPeU SALUD
    // ==========================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // ==========================================
                        // 1. AUTENTICACION
                        // ==========================================

                        // LOGIN PUBLICO
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/login"
                        ).permitAll()

                        // REGISTRO SOLO ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/auth/registro"
                        ).hasAuthority("ADMIN")

                        // BLOQUEAR OTRAS RUTAS AUTH
                        .requestMatchers(
                                "/api/v1/auth/**"
                        ).denyAll()

                        // ==========================================
                        // 2. SWAGGER
                        // ==========================================

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // ==========================================
                        // 3. PORTAL DEL PACIENTE
                        // SIN LOGIN
                        // ==========================================


                        // CONSULTAR PACIENTE POR DNI
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/personas/dni/**"
                        ).permitAll()

                        // CONSULTAR PACIENTE POR CODIGO UNIVERSITARIO
                        // PORTAL DEL PACIENTE SIN LOGIN
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/personas/portal/codigo/**"
                        ).permitAll()

                        // CONSULTAR FONDO ESTUDIANTIL
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/personas/fondo/**"
                        ).permitAll()


                        // CONSULTAR MEDICOS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/medicos",
                                "/api/v1/medicos/**"
                        ).permitAll()

                        // CONSULTAR HORARIOS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/horarios-medicos/medico/**"
                        ).permitAll()

                        // CONSULTAR HORAS OCUPADAS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas/ocupadas/medico/**"
                        ).permitAll()

                        // CONSULTAR CITAS DEL MEDICO
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas/medico/**"
                        ).permitAll()

                        // CONSULTAR CITAS DEL PACIENTE
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas/paciente/**"
                        ).permitAll()

                        // REGISTRAR CITA DESDE EL PORTAL
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/citas"
                        ).permitAll()

                        // ANULAR Y REPROGRAMAR
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/v1/citas/*/anular",
                                "/api/v1/citas/*/reprogramar"
                        ).permitAll()

                        // ==========================================
                        // 4. PERSONAS Y PACIENTES
                        // ==========================================

                        // GESTION ADMINISTRATIVA
                        .requestMatchers(
                                "/api/v1/personas",
                                "/api/v1/personas/**"
                        ).hasAuthority("ADMIN")

                        // ==========================================
                        // 5. CITAS MEDICAS
                        // ==========================================

                        // CITAS DEL MEDICO AUTENTICADO
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas/mis-citas"
                        ).hasAuthority("MEDICO")

                        // PRODUCTIVIDAD MEDICA
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas/productividad-medicos"
                        ).hasAuthority("ADMIN")

                        // ALERTAS DE TRIAJE
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas/alertas-triaje"
                        ).hasAuthority("TRIAJE")

                        // HISTORIAL DE PACIENTES
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas/historial-pacientes"
                        ).hasAuthority("MEDICO")

                        // LISTADO GENERAL DE CITAS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas"
                        ).hasAnyAuthority(
                                "ADMIN",
                                "TRIAJE"
                        )

                        // CONSULTAR CITA INDIVIDUAL
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/citas/*"
                        ).hasAnyAuthority(
                                "ADMIN",
                                "MEDICO",
                                "TRIAJE"
                        )

                        // ACTUALIZAR CITAS
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/citas/**"
                        ).hasAnyAuthority(
                                "ADMIN",
                                "MEDICO",
                                "TRIAJE"
                        )

                        // CAMBIAR ESTADOS
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/v1/citas/**"
                        ).hasAnyAuthority(
                                "ADMIN",
                                "MEDICO",
                                "TRIAJE"
                        )

                        // ELIMINAR CITAS
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/v1/citas/**"
                        ).hasAuthority("ADMIN")

                        // OTRAS OPERACIONES DE CITAS
                        .requestMatchers(
                                "/api/v1/citas/**"
                        ).denyAll()

                        // ==========================================
                        // 6. PAGOS
                        // ==========================================

                        .requestMatchers(
                                "/api/v1/pagos",
                                "/api/v1/pagos/**"
                        ).hasAuthority("ADMIN")

                        // ==========================================
                        // 7. RECETAS MEDICAS
                        // ==========================================

                        // CONSULTAR RECETAS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/recetas",
                                "/api/v1/recetas/**"
                        ).hasAnyAuthority(
                                "MEDICO",
                                "FARMACIA"
                        )

                        // REGISTRAR Y MODIFICAR RECETAS
                        .requestMatchers(
                                "/api/v1/recetas",
                                "/api/v1/recetas/**"
                        ).hasAuthority("MEDICO")

                        // ==========================================
                        // 8. DERIVACIONES MEDICAS
                        // ==========================================

                        .requestMatchers(
                                "/api/v1/derivaciones",
                                "/api/v1/derivaciones/**"
                        ).hasAuthority("MEDICO")

                        // ==========================================
                        // 9. FARMACIA
                        // ==========================================

                        // CONSULTAR MEDICAMENTOS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/medicamentos",
                                "/api/v1/medicamentos/**"
                        ).hasAnyAuthority(
                                "ADMIN","MEDICO",
                                "FARMACIA"
                        )

                        // ADMINISTRAR MEDICAMENTOS
                        .requestMatchers(
                                "/api/v1/medicamentos",
                                "/api/v1/medicamentos/**"
                        ).hasAuthority("FARMACIA")

                        // DETALLES DE MEDICAMENTOS
                        .requestMatchers(
                                "/api/v1/detalle-medicamentos",
                                "/api/v1/detalle-medicamentos/**"
                        ).hasAuthority("FARMACIA")

                        // ==========================================
                        // 10. EMPLEADOS
                        // ==========================================

                        .requestMatchers(
                                "/api/v1/empleados",
                                "/api/v1/empleados/**"
                        ).hasAuthority("ADMIN")

                        // ==========================================
                        // 11. MEDICOS
                        // ==========================================

                        // LOS GET PUBLICOS YA ESTAN DEFINIDOS
                        .requestMatchers(
                                "/api/v1/medicos",
                                "/api/v1/medicos/**"
                        ).hasAuthority("ADMIN")

                        // ==========================================
                        // 12. HORARIOS MEDICOS
                        // ==========================================

                        .requestMatchers(
                                "/api/v1/horarios-medicos",
                                "/api/v1/horarios-medicos/**"
                        ).hasAuthority("ADMIN")

                        // ==========================================
                        // 13. TRIAJE
                        // ==========================================

                        .requestMatchers(
                                "/api/v1/triaje",
                                "/api/v1/triaje/**"
                        ).hasAuthority("TRIAJE")

                        // ==========================================
                        // 14. ATENCION MEDICA
                        // ==========================================

                        .requestMatchers(
                                "/api/v1/atenciones",
                                "/api/v1/atenciones/**"
                        ).hasAuthority("MEDICO")

                        // ==========================================
                        // 15. REPORTES
                        // ==========================================

                        .requestMatchers(
                                "/api/v1/reportes",
                                "/api/v1/reportes/**"
                        ).hasAuthority("ADMIN")

                        // ==========================================
                        // 16. SINCRONIZACION OFFLINE
                        // ==========================================

                        .requestMatchers(
                                "/api/v1/sincronizacion",
                                "/api/v1/sincronizacion/**",
                                "/api/v1/sync",
                                "/api/v1/sync/**"
                        ).hasAuthority("ADMIN")

                        // ==========================================
                        // 17. OTRAS RUTAS
                        // ==========================================

                        .anyRequest().denyAll()
                )

                // ==========================================
                // JWT SIN SESIONES
                // ==========================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authenticationProvider(
                        authenticationProvider
                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                // ==========================================
                // MANEJO DE ERRORES
                // ==========================================

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                authenticationEntryPoint
                        )
                        .accessDeniedHandler(
                                accessDeniedHandler
                        )
                );

        return http.build();
    }

    // ==========================================
    // CORS PARA ANGULAR
    // ==========================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:4200")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}
