
package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.upeu.centromedico.centro_medico.dto.MedicoDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Empleado;
import pe.edu.upeu.centromedico.centro_medico.entity.Medico;
import pe.edu.upeu.centromedico.centro_medico.repository.EmpleadoRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.MedicoRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MedicoServiceImpl implements IMedicoService {

    private final MedicoRepository medicoRepository;
    private final EmpleadoRepository empleadoRepository;

    public MedicoServiceImpl(
            MedicoRepository medicoRepository,
            EmpleadoRepository empleadoRepository) {

        this.medicoRepository = medicoRepository;
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    public List<MedicoDTO> listarTodo() {

        List<Medico> lista = medicoRepository.findAll();
        List<MedicoDTO> respuesta = new ArrayList<>();

        for (Medico medico : lista) {
            respuesta.add(convertirADto(medico));
        }

        return respuesta;
    }

    @Override
    public Optional<MedicoDTO> buscarPorId(Long id) {

        return medicoRepository.findById(id)
                .map(this::convertirADto);
    }

    @Override
    public MedicoDTO crear(MedicoDTO dto) {

        Empleado empleado = empleadoRepository.findById(dto.idEmpleado())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El empleado indicado no existe"
                ));

        if (medicoRepository.existsById(dto.idEmpleado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El empleado ya está registrado como médico"
            );
        }

        Medico medico = new Medico();

        medico.setEmpleado(empleado);
        medico.setEspecialidad(dto.especialidad());
        medico.setCodigoCol(dto.codigoCol());

        Medico guardado = medicoRepository.save(medico);

        return convertirADto(guardado);
    }

    @Override
    public Optional<MedicoDTO> actualizar(
            Long id,
            MedicoDTO dto) {

        return medicoRepository.findById(id).map(medico -> {

            medico.setEspecialidad(dto.especialidad());
            medico.setCodigoCol(dto.codigoCol());

            Medico actualizado = medicoRepository.save(medico);

            return convertirADto(actualizado);
        });
    }

    private MedicoDTO convertirADto(Medico medico) {

        return new MedicoDTO(
                medico.getIdEmpleado(),
                medico.getEspecialidad(),
                medico.getCodigoCol()
        );
    }
}
