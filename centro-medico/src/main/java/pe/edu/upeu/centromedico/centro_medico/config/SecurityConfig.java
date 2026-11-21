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
            CustomAuthenticationEntryPoint authenticationEntryPoint) {
        this.jwtFilter = jwtFilter;
        this.authenticationProvider = authenticationProvider;
        this.accessDeniedHandler = accessDeniedHandler;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1. Rutas públicas: autenticación y Swagger
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                        // 2. Rutas públicas del Portal del Paciente (sin login, por DNI)
                        .requestMatchers(HttpMethod.GET, "/api/v1/personas/dni/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/personas/fondo/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/medicos", "/api/v1/medicos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/horarios-medicos/medico/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/citas/medico/**", "/api/v1/citas/paciente/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/citas").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/citas/*/anular", "/api/v1/citas/*/reprogramar").permitAll()

                        // 3. Pacientes / Personas
                        .requestMatchers(HttpMethod.GET, "/api/v1/personas/**")
                        .hasAnyAuthority("ADMIN", "RECEPCION", "TRIAJE", "MEDICO", "FARMACIA")
                        .requestMatchers("/api/v1/personas/**")
                        .hasAnyAuthority("ADMIN", "RECEPCION")

                        // 4. Citas (Recepción, Triaje, Atención Médica)
                        .requestMatchers(HttpMethod.GET, "/api/v1/citas/**")
                        .hasAnyAuthority("ADMIN", "RECEPCION", "TRIAJE", "MEDICO", "FARMACIA")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/citas/**")
                        .hasAnyAuthority("ADMIN", "RECEPCION", "TRIAJE", "MEDICO")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/citas/**")
                        .hasAnyAuthority("ADMIN", "RECEPCION", "TRIAJE", "MEDICO")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/citas/**")
                        .hasAnyAuthority("ADMIN", "RECEPCION")

                        // 5. Caja / Pagos
                        .requestMatchers("/api/v1/pagos/**")
                        .hasAnyAuthority("ADMIN", "RECEPCION")

                        // 6. Recetas
                        .requestMatchers(HttpMethod.GET, "/api/v1/recetas/**")
                        .hasAnyAuthority("ADMIN", "MEDICO", "FARMACIA")
                        .requestMatchers("/api/v1/recetas/**")
                        .hasAnyAuthority("ADMIN", "MEDICO")

                        // 7. Derivaciones
                        .requestMatchers(HttpMethod.GET, "/api/v1/derivaciones/**")
                        .hasAnyAuthority("ADMIN", "MEDICO", "RECEPCION")
                        .requestMatchers("/api/v1/derivaciones/**")
                        .hasAnyAuthority("ADMIN", "MEDICO")

                        // 8. Farmacia (Medicamentos y Entregas)
                        .requestMatchers(HttpMethod.GET, "/api/v1/medicamentos/**")
                        .hasAnyAuthority("ADMIN", "FARMACIA", "MEDICO")
                        .requestMatchers("/api/v1/medicamentos/**", "/api/v1/detalle-medicamentos/**")
                        .hasAnyAuthority("ADMIN", "FARMACIA")

                        // 9. Empleados, Médicos y Horarios
                        .requestMatchers(HttpMethod.GET, "/api/v1/empleados/**", "/api/v1/horarios-medicos/**")
                        .hasAnyAuthority("ADMIN", "RECEPCION", "TRIAJE", "MEDICO", "FARMACIA")
                        .requestMatchers("/api/v1/empleados/**", "/api/v1/medicos/**", "/api/v1/horarios-medicos/**")
                        .hasAuthority("ADMIN")

                        // 10. Reportes de gestión
                        .requestMatchers("/api/v1/reportes/**")
                        .hasAuthority("ADMIN")

                        .anyRequest().authenticated()
                )
                .sessionManagement(sess ->
                        sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
