package pe.edu.upeu.centromedico.centro_medico.dto;

public record AuthResponse(
        String token,
        String usuario,
        String rol,
        Long idUsuario,
        Long idPersona
) {
}
