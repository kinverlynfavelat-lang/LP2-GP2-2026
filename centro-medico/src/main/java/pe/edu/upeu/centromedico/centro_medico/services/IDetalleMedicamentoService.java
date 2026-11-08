
package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.DetalleMedicamentoDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.DetalleMedicamentoResponseDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IDetalleMedicamentoService {

    List<DetalleMedicamentoResponseDTO> listarTodo();

    Optional<DetalleMedicamentoResponseDTO> buscarPorId(Long id);

    DetalleMedicamentoResponseDTO registrarEntrega(
            DetalleMedicamentoDTO dto
    );

    List<DetalleMedicamentoResponseDTO> listarPorDetalleReceta(
            Long idDetalleReceta
    );

    List<DetalleMedicamentoResponseDTO> listarPorFecha(
            LocalDate fecha
    );

    List<DetalleMedicamentoResponseDTO> listarPorPeriodo(
            LocalDate fechaInicio,
            LocalDate fechaFin
    );

}
