
package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.upeu.centromedico.centro_medico.dto.PersonaDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Persona;
import pe.edu.upeu.centromedico.centro_medico.entity.Usuario;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPaciente;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPersona;
import pe.edu.upeu.centromedico.centro_medico.repository.PersonaRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonaServiceImpl implements IPersonaService {

    private final PersonaRepository personaRepository;
    private final UsuarioRepository usuarioRepository;

    public PersonaServiceImpl(
            PersonaRepository personaRepository,
            UsuarioRepository usuarioRepository) {
        this.personaRepository = personaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<PersonaDTO> listarTodo() {
        List<Persona> lista = personaRepository.findAll();
        List<PersonaDTO> respuesta = new ArrayList<>();

        for (Persona p : lista) {
            respuesta.add(convertirDTO(p));
        }

        return respuesta;
    }

    @Override
    public Optional<PersonaDTO> buscarPorId(Long id) {
        Optional<Persona> persona = personaRepository.findById(id);

        if (persona.isPresent()) {
            return Optional.of(convertirDTO(persona.get()));
        }

        return Optional.empty();
    }

    @Override
    public Optional<PersonaDTO> buscarPorDni(String dni) {
        Optional<Persona> persona = personaRepository.findByDni(dni);

        if (persona.isPresent()) {
            return Optional.of(convertirDTO(persona.get()));
        }

        return Optional.empty();
    }

    @Override
    public Optional<PersonaDTO> buscarPorCodigo(String codigoUniversitario) {
        Optional<Persona> persona =
                personaRepository.findByCodigoUniversitario(codigoUniversitario);

        if (persona.isPresent()) {
            return Optional.of(convertirDTO(persona.get()));
        }

        return Optional.empty();
    }

    @Override
    public PersonaDTO crear(PersonaDTO p) {

        if (personaRepository.findByDni(p.dni()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una persona registrada con ese DNI"
            );
        }

        if (p.codigoUniversitario() != null
                && !p.codigoUniversitario().isBlank()
                && personaRepository.findByCodigoUniversitario(
                p.codigoUniversitario()).isPresent()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El código universitario ya está registrado"
            );
        }

        Persona persona = new Persona();

        persona.setDni(p.dni());
        persona.setNombres(p.nombres());
        persona.setApellidos(p.apellidos());
        persona.setCorreo(p.correo());
        persona.setTelefono(p.telefono());
        persona.setDireccion(p.direccion());
        persona.setFechaNacimiento(p.fechaNacimiento());
        persona.setEstadoCivil(p.estadoCivil());
        persona.setAlergias(p.alergias());
        persona.setTipoPersona(p.tipoPersona());
        persona.setTipoPaciente(p.tipoPaciente());
        persona.setCodigoUniversitario(p.codigoUniversitario());
        persona.setMatriculaVigente(p.matriculaVigente());
        persona.setEstado(p.estado());

        if (p.tipoPaciente() == TipoPaciente.ESTUDIANTE) {

            persona.setSaldoFondo(
                    p.saldoFondo() == null
                            ? new BigDecimal("200.00")
                            : p.saldoFondo()
            );

        } else {
            persona.setSaldoFondo(null);
        }

        if (p.idUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(p.idUsuario())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "El usuario indicado no existe"
                    ));

            persona.setUsuario(usuario);
        }

        Persona guardada = personaRepository.save(persona);

        return convertirDTO(guardada);
    }

    @Override
    public Optional<PersonaDTO> actualizar(Long id, PersonaDTO p) {

        Optional<Persona> persona = personaRepository.findById(id);

        if (persona.isPresent()) {

            Persona personaActual = persona.get();

            Optional<Persona> personaDni =
                    personaRepository.findByDni(p.dni());

            if (personaDni.isPresent()
                    && !personaDni.get().getIdPersona().equals(id)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El DNI ya pertenece a otra persona"
                );
            }

            if (p.codigoUniversitario() != null
                    && !p.codigoUniversitario().isBlank()) {

                Optional<Persona> personaCodigo =
                        personaRepository.findByCodigoUniversitario(
                                p.codigoUniversitario());

                if (personaCodigo.isPresent()
                        && !personaCodigo.get().getIdPersona().equals(id)) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "El código universitario ya pertenece a otra persona"
                    );
                }
            }

            personaActual.setDni(p.dni());
            personaActual.setNombres(p.nombres());
            personaActual.setApellidos(p.apellidos());
            personaActual.setCorreo(p.correo());
            personaActual.setTelefono(p.telefono());
            personaActual.setDireccion(p.direccion());
            personaActual.setFechaNacimiento(p.fechaNacimiento());
            personaActual.setEstadoCivil(p.estadoCivil());
            personaActual.setAlergias(p.alergias());
            personaActual.setTipoPersona(p.tipoPersona());
            personaActual.setTipoPaciente(p.tipoPaciente());
            personaActual.setCodigoUniversitario(p.codigoUniversitario());
            personaActual.setMatriculaVigente(p.matriculaVigente());
            personaActual.setEstado(p.estado());

            // El saldo no se modifica desde el formulario.

            if (p.idUsuario() != null) {
                Usuario usuario = usuarioRepository.findById(p.idUsuario())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "El usuario indicado no existe"
                        ));

                personaActual.setUsuario(usuario);
            }

            Persona actualizada = personaRepository.save(personaActual);

            return Optional.of(convertirDTO(actualizada));
        }

        return Optional.empty();
    }

    @Override
    public boolean eliminar(Long id) {

        if (personaRepository.existsById(id)) {
            personaRepository.deleteById(id);
            return true;
        }

        return false;
    }

    private PersonaDTO convertirDTO(Persona p) {
        return new PersonaDTO(
                p.getIdPersona(),
                p.getDni(),
                p.getNombres(),
                p.getApellidos(),
                p.getCorreo(),
                p.getTelefono(),
                p.getDireccion(),
                p.getFechaNacimiento(),
                p.getEstadoCivil(),
                p.getAlergias(),
                p.getTipoPersona(),
                p.getTipoPaciente(),
                p.getCodigoUniversitario(),
                p.getSaldoFondo(),
                p.getMatriculaVigente(),
                p.getEstado(),
                p.getUsuario() != null
                        ? p.getUsuario().getIdUsuario()
                        : null
        );
    }
}
