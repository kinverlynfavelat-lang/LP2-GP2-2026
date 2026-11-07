package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.MedicamentoDTO;

import java.util.List;
import java.util.Optional;

public interface IMedicamentoService {

    List<MedicamentoDTO> listarTodo();

    Optional<MedicamentoDTO> buscarPorId(Long id);

    MedicamentoDTO crear(MedicamentoDTO dto);

    Optional<MedicamentoDTO> actualizar(
            Long id,
            MedicamentoDTO dto
    );

    boolean eliminar(Long id);
    Optional<MedicamentoDTO> ingresarStock(Long id, Integer cantidad);

    Optional<MedicamentoDTO> descontarStock(Long id, Integer cantidad);
}