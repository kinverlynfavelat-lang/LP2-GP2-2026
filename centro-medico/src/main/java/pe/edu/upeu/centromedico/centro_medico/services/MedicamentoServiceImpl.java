package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.centromedico.centro_medico.dto.MedicamentoDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Medicamento;
import pe.edu.upeu.centromedico.centro_medico.repository.MedicamentoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class MedicamentoServiceImpl implements IMedicamentoService {

    private final MedicamentoRepository medicamentoRepository;

    public MedicamentoServiceImpl(MedicamentoRepository medicamentoRepository) {
        this.medicamentoRepository = medicamentoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicamentoDTO> listarTodo() {

        return medicamentoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MedicamentoDTO> buscarPorId(Long id) {

        return medicamentoRepository.findById(id)
                .map(this::convertirADTO);
    }

    @Override
    @Transactional
    public MedicamentoDTO crear(MedicamentoDTO dto) {

        Medicamento medicamento = new Medicamento();

        medicamento.setNombre(dto.nombre());
        medicamento.setDescripcion(dto.descripcion());
        medicamento.setStock(dto.stock());
        medicamento.setPrecio(dto.precio());
        medicamento.setEstado(dto.estado());

        Medicamento guardado = medicamentoRepository.save(medicamento);

        return convertirADTO(guardado);
    }

    @Override
    @Transactional
    public Optional<MedicamentoDTO> actualizar(
            Long id,
            MedicamentoDTO dto) {

        return medicamentoRepository.findById(id).map(medicamento -> {

            medicamento.setNombre(dto.nombre());
            medicamento.setDescripcion(dto.descripcion());
            medicamento.setPrecio(dto.precio());
            medicamento.setEstado(dto.estado());

            Medicamento actualizado = medicamentoRepository.save(medicamento);

            return convertirADTO(actualizado);
        });
    }
    @Override
    @Transactional
    public Optional<MedicamentoDTO> ingresarStock(Long id, Integer cantidad) {

        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }

        return medicamentoRepository.findById(id).map(medicamento -> {

            medicamento.setStock(medicamento.getStock() + cantidad);

            return convertirADTO(medicamentoRepository.save(medicamento));
        });
    }

    @Override
    @Transactional
    public Optional<MedicamentoDTO> descontarStock(Long id, Integer cantidad) {

        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }

        return medicamentoRepository.findById(id).map(medicamento -> {

            if (medicamento.getStock() < cantidad) {
                throw new IllegalArgumentException("Stock insuficiente");
            }

            medicamento.setStock(medicamento.getStock() - cantidad);

            return convertirADTO(medicamentoRepository.save(medicamento));
        });
    }
    @Override
    @Transactional
    public boolean eliminar(Long id) {

        if (medicamentoRepository.existsById(id)) {

            medicamentoRepository.deleteById(id);
            return true;
        }

        return false;
    }

    private MedicamentoDTO convertirADTO(Medicamento m) {

        return new MedicamentoDTO(
                m.getIdMedicamento(),
                m.getNombre(),
                m.getDescripcion(),
                m.getStock(),
                m.getPrecio(),
                m.getEstado()
        );
    }
}