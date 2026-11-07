
package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.upeu.centromedico.centro_medico.dto.EmpleadoDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Empleado;
import pe.edu.upeu.centromedico.centro_medico.entity.Persona;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPersona;
import pe.edu.upeu.centromedico.centro_medico.repository.EmpleadoRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.PersonaRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EmpleadoServiceImpl implements IEmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final PersonaRepository personaRepository;

    public EmpleadoServiceImpl(
            EmpleadoRepository empleadoRepository,
            PersonaRepository personaRepository) {

        this.empleadoRepository = empleadoRepository;
        this.personaRepository = personaRepository;
    }

    @Override
    public List<EmpleadoDTO> listarTodo() {

        List<Empleado> lista = empleadoRepository.findAll();
        List<EmpleadoDTO> respuesta = new ArrayList<>();

        for (Empleado e : lista) {
            respuesta.add(new EmpleadoDTO(
                    e.getIdPersona(),
                    e.getFechaIngreso(),
                    e.getSueldo()
            ));
        }

        return respuesta;
    }

    @Override
    public Optional<EmpleadoDTO> buscarPorId(Long id) {

        return empleadoRepository.findById(id)
                .map(e -> new EmpleadoDTO(
                        e.getIdPersona(),
                        e.getFechaIngreso(),
                        e.getSueldo()
                ));
    }

    @Override
    public EmpleadoDTO crear(EmpleadoDTO dto) {

        Persona persona = personaRepository.findById(dto.idPersona())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La persona indicada no existe"
                ));

        if (persona.getTipoPersona() != TipoPersona.EMPLEADO) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La persona no está registrada como empleado"
            );
        }

        if (empleadoRepository.existsById(dto.idPersona())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La persona ya está registrada como empleado"
            );
        }

        Empleado empleado = new Empleado();

        empleado.setPersona(persona);
        empleado.setFechaIngreso(dto.fechaIngreso());
        empleado.setSueldo(dto.sueldo());

        Empleado guardado = empleadoRepository.save(empleado);

        return new EmpleadoDTO(
                guardado.getIdPersona(),
                guardado.getFechaIngreso(),
                guardado.getSueldo()
        );
    }

    @Override
    public Optional<EmpleadoDTO> actualizar(
            Long id,
            EmpleadoDTO dto) {

        return empleadoRepository.findById(id).map(empleado -> {

            empleado.setFechaIngreso(dto.fechaIngreso());
            empleado.setSueldo(dto.sueldo());

            Empleado actualizado = empleadoRepository.save(empleado);

            return new EmpleadoDTO(
                    actualizado.getIdPersona(),
                    actualizado.getFechaIngreso(),
                    actualizado.getSueldo()
            );
        });
    }
}
