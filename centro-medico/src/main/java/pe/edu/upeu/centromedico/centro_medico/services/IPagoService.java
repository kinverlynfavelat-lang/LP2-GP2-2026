package pe.edu.upeu.centromedico.centro_medico.services;

import pe.edu.upeu.centromedico.centro_medico.dto.PagoDTO;

import java.util.List;
import java.util.Optional;

public interface IPagoService {

    List<PagoDTO> listarTodo();

    Optional<PagoDTO> buscarPorId(Long id);

    String registrarPago(PagoDTO dto);

}