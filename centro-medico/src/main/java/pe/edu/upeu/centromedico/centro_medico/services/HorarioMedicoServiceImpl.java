
package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.upeu.centromedico.centro_medico.dto.HorarioMedicoDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.HorarioMedico;
import pe.edu.upeu.centromedico.centro_medico.entity.Medico;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoHorario;
import pe.edu.upeu.centromedico.centro_medico.repository.HorarioMedicoRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.MedicoRepository;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HorarioMedicoServiceImpl implements IHorarioMedicoService {

    private final HorarioMedicoRepository horarioMedicoRepository;
    private final MedicoRepository medicoRepository;

    public HorarioMedicoServiceImpl(
            HorarioMedicoRepository horarioMedicoRepository,
            MedicoRepository medicoRepository) {

        this.horarioMedicoRepository = horarioMedicoRepository;
        this.medicoRepository = medicoRepository;
    }

    @Override
    public List<HorarioMedicoDTO> listarPorMedico(Long idMedico) {

        if (!medicoRepository.existsById(idMedico)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "El médico indicado no existe"
            );
        }

        List<HorarioMedico> lista =
                horarioMedicoRepository.findByMedicoIdEmpleado(idMedico);

        List<HorarioMedicoDTO> respuesta = new ArrayList<>();

        for (HorarioMedico h : lista) {
            respuesta.add(convertirADto(h));
        }

        return respuesta;
    }

    @Override
    public Optional<HorarioMedicoDTO> buscarPorId(Long id) {

        Optional<HorarioMedico> horario =
                horarioMedicoRepository.findById(id);

        if (horario.isPresent()) {
            return Optional.of(convertirADto(horario.get()));
        }

        return Optional.empty();
    }

    @Override
    @Transactional
    public HorarioMedicoDTO crear(HorarioMedicoDTO dto) {

        Medico medico = medicoRepository.findById(dto.idMedico())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El médico indicado no existe"
                ));

        validarHorario(dto, null);

        HorarioMedico horario = new HorarioMedico();

        horario.setDiaSemana(dto.diaSemana());
        horario.setHoraInicio(dto.horaInicio());
        horario.setHoraFin(dto.horaFin());
        horario.setEstado(dto.estado());
        horario.setMedico(medico);

        HorarioMedico guardado =
                horarioMedicoRepository.save(horario);

        return convertirADto(guardado);
    }

    @Override
    @Transactional
    public Optional<HorarioMedicoDTO> actualizar(
            Long id,
            HorarioMedicoDTO dto) {

        Optional<HorarioMedico> horario =
                horarioMedicoRepository.findById(id);

        if (horario.isPresent()) {

            HorarioMedico horarioActual = horario.get();

            if (!horarioActual.getMedico().getIdEmpleado()
                    .equals(dto.idMedico())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No se puede cambiar el médico asociado al horario"
                );
            }

            validarHorario(dto, id);

            horarioActual.setDiaSemana(dto.diaSemana());
            horarioActual.setHoraInicio(dto.horaInicio());
            horarioActual.setHoraFin(dto.horaFin());
            horarioActual.setEstado(dto.estado());

            HorarioMedico actualizado =
                    horarioMedicoRepository.save(horarioActual);

            return Optional.of(convertirADto(actualizado));
        }

        return Optional.empty();
    }

    private void validarHorario(
            HorarioMedicoDTO dto,
            Long idHorarioActual) {

        LocalTime inicio;
        LocalTime fin;

        try {
            inicio = LocalTime.parse(dto.horaInicio());
            fin = LocalTime.parse(dto.horaFin());

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Las horas deben tener el formato HH:mm"
            );
        }

        if (!inicio.isBefore(fin)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La hora de inicio debe ser anterior a la hora de fin"
            );
        }

        if (dto.estado() == EstadoHorario.ACTIVO) {

            List<HorarioMedico> horarios =
                    horarioMedicoRepository
                            .findByMedicoIdEmpleadoAndDiaSemana(
                                    dto.idMedico(),
                                    dto.diaSemana()
                            );

            for (HorarioMedico h : horarios) {

                if (h.getEstado() != EstadoHorario.ACTIVO) {
                    continue;
                }

                if (idHorarioActual != null
                        && h.getIdHorario().equals(idHorarioActual)) {
                    continue;
                }

                LocalTime inicioExistente =
                        LocalTime.parse(h.getHoraInicio());

                LocalTime finExistente =
                        LocalTime.parse(h.getHoraFin());

                boolean seCruzan =
                        inicio.isBefore(finExistente)
                                && fin.isAfter(inicioExistente);

                if (seCruzan) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "El médico ya tiene un horario activo en ese intervalo"
                    );
                }
            }
        }
    }

    private HorarioMedicoDTO convertirADto(HorarioMedico h) {

        return new HorarioMedicoDTO(
                h.getIdHorario(),
                h.getDiaSemana(),
                h.getHoraInicio(),
                h.getHoraFin(),
                h.getEstado(),
                h.getMedico().getIdEmpleado()
        );
    }
}
