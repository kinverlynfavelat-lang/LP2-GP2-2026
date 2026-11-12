package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.upeu.centromedico.centro_medico.dto.CitaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.CitaResponseDTO;

import pe.edu.upeu.centromedico.centro_medico.dto.MedicoProductividadDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Cita;
import pe.edu.upeu.centromedico.centro_medico.entity.Persona;
import pe.edu.upeu.centromedico.centro_medico.entity.Medico;
import pe.edu.upeu.centromedico.centro_medico.entity.Empleado;
import pe.edu.upeu.centromedico.centro_medico.entity.HorarioMedico;

import pe.edu.upeu.centromedico.centro_medico.enums.*;

import pe.edu.upeu.centromedico.centro_medico.repository.CitaRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.PersonaRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.MedicoRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.EmpleadoRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.HorarioMedicoRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CitaServiceImpl implements ICitaService {

    private final CitaRepository citaRepository;
    private final PersonaRepository personaRepository;
    private final MedicoRepository medicoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final HorarioMedicoRepository horarioMedicoRepository;
    @PersistenceContext
    private EntityManager entityManager;
    public CitaServiceImpl(
            CitaRepository citaRepository,
            PersonaRepository personaRepository,
            MedicoRepository medicoRepository,
            EmpleadoRepository empleadoRepository,
            HorarioMedicoRepository horarioMedicoRepository) {

        this.citaRepository = citaRepository;
        this.personaRepository = personaRepository;
        this.medicoRepository = medicoRepository;
        this.empleadoRepository = empleadoRepository;
        this.horarioMedicoRepository = horarioMedicoRepository;
    }

    // ==================================
    // LISTAR TODAS LAS CITAS
    // ==================================

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarTodo() {

        List<Cita> lista = citaRepository.findAll();
        List<CitaResponseDTO> respuesta = new ArrayList<>();

        for (Cita c : lista) {
            respuesta.add(convertirADTO(c));
        }

        return respuesta;
    }

    // ==================================
    // BUSCAR CITA POR ID
    // ==================================

    @Override
    @Transactional(readOnly = true)
    public Optional<CitaResponseDTO> buscarPorId(Long id) {

        Optional<Cita> cita = citaRepository.findById(id);

        if (cita.isPresent()) {

            Cita c = cita.get();

            return Optional.of(convertirADTO(c));
        }

        return Optional.empty();
    }

    // ==================================
    // LISTAR CITAS POR PACIENTE
    // ==================================

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarPorPaciente(Long idPersona) {

        List<Cita> lista =
                citaRepository.findByPersonaIdPersona(idPersona);

        List<CitaResponseDTO> respuesta = new ArrayList<>();

        for (Cita c : lista) {
            respuesta.add(convertirADTO(c));
        }

        return respuesta;
    }

    // ==================================
    // LISTAR ÚLTIMA CITA POR PACIENTE
    // ==================================
    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarUltimasPorPaciente() {
        List<Cita> lista =
                citaRepository.findUltimasCitasPorPaciente();

        List<CitaResponseDTO> respuesta = new ArrayList<>();

        for (Cita c : lista) {
            respuesta.add(convertirADTO(c));
        }

        return respuesta;
    }

    // ===========================================
    // TRIAJE Citas con signos vitales críticos
    // ===========================================

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarCitasCriticas(BigDecimal tempLimite, BigDecimal presionLimite) {

        BigDecimal temp = (tempLimite != null) ? tempLimite : new BigDecimal("38.0");
        BigDecimal pres = (presionLimite != null) ? presionLimite : new BigDecimal("120.0");

        List<Cita> lista = citaRepository.findCitasConSignosCriticos(temp, pres);
        List<CitaResponseDTO> respuesta = new ArrayList<>();

        for (Cita c : lista) {
            respuesta.add(convertirADTO(c));
        }

        return respuesta;
    }

    // =================================================
    // PRODUCTIVIDAD MÉDICA Reporte de citas por médico
    // =================================================

    @Override
    @Transactional(readOnly = true)
    public List<MedicoProductividadDTO> obtenerProductividadMedicos() {

        return citaRepository.obtenerProductividadMedicos();
    }

    // ==================================
    // LISTAR CITAS POR MEDICO
    // ==================================

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarPorMedico(Long idMedico) {

        List<Cita> lista =
                citaRepository.findByMedicoIdEmpleado(idMedico);

        List<CitaResponseDTO> respuesta = new ArrayList<>();

        for (Cita c : lista) {
            respuesta.add(convertirADTO(c));
        }

        return respuesta;
    }



    @Override
    @Transactional
    public CitaResponseDTO crear(CitaDTO dto) {

        // 1. Validar datos obligatorios
        if (dto.idPersona() == null) {
            throw new RuntimeException("El paciente es obligatorio");
        }

        if (dto.fechaCita() == null || dto.horaCita() == null) {
            throw new RuntimeException("La fecha y hora son obligatorias");
        }

        if (dto.motivoConsulta() == null ||
                dto.motivoConsulta().isBlank()) {
            throw new RuntimeException("El motivo de consulta es obligatorio");
        }

        // 2. Buscar paciente
        Persona paciente = personaRepository.findById(dto.idPersona())
                .orElseThrow(() ->
                        new RuntimeException("Paciente no encontrado"));

        validarPaciente(paciente);

        // 3. Crear cita
        Cita cita = new Cita();

        cita.setFechaCita(dto.fechaCita());
        cita.setHoraCita(dto.horaCita());

        cita.setNotificacion(
                dto.notificacion() == null ? "N" : dto.notificacion()
        );

        cita.setMotivoConsulta(dto.motivoConsulta());

        cita.setTemperatura(dto.temperatura());
        cita.setPresion(dto.presion());
        cita.setFrecuenciaCardiaca(dto.frecuenciaCardiaca());
        cita.setFrecuenciaRespiratoria(dto.frecuenciaRespiratoria());
        cita.setPeso(dto.peso());
        cita.setTalla(dto.talla());

        cita.setDiagnostico(dto.diagnostico());
        cita.setTratamiento(dto.tratamiento());
        cita.setObservaciones(dto.observaciones());
        cita.setIndicaciones(dto.indicaciones());

        cita.setPersona(paciente);

        // 4. Asignar médico
        if (dto.idMedico() != null) {

            Medico medico = medicoRepository.findById(dto.idMedico())
                    .orElseThrow(() ->
                            new RuntimeException("Médico no encontrado"));

            cita.setMedico(medico);
        }

        // 5. Asignar empleado de triaje
        if (dto.idEmpleado() != null) {

            Empleado empleado = empleadoRepository.findById(dto.idEmpleado())
                    .orElseThrow(() ->
                            new RuntimeException("Empleado no encontrado"));

            cita.setEmpleado(empleado);
        }


        // 6. Determinar estado inicial
        if (dto.estado() == EstadoCita.DERIVADO) {
            cita.setEstado(EstadoCita.DERIVADO);
        } else {
            cita.setEstado(EstadoCita.RECEPCION);
        }

        // 7. Registrar la cita y obtener su ID
        Cita guardada = citaRepository.saveAndFlush(cita);

        // 8. Descuento automatico para estudiantes
        if (dto.estado() != EstadoCita.DERIVADO
                && paciente.getTipoPaciente() == TipoPaciente.ESTUDIANTE
                && paciente.getMatriculaVigente() == SiNo.SI) {

            StoredProcedureQuery procedimiento =
                    entityManager.createStoredProcedureQuery(
                            "SP_DESCONTAR_FONDO_ESTUDIANTIL");

            procedimiento.registerStoredProcedureParameter(
                    1, Long.class, ParameterMode.IN);

            procedimiento.registerStoredProcedureParameter(
                    2, BigDecimal.class, ParameterMode.OUT);

            procedimiento.registerStoredProcedureParameter(
                    3, BigDecimal.class, ParameterMode.OUT);

            procedimiento.setParameter(
                    1, guardada.getIdCita());

            procedimiento.execute();

            // 9. Consultar cuanto falta pagar
            Number resultado = (Number)
                    procedimiento.getOutputParameterValue(3);

            BigDecimal montoCaja =
                    new BigDecimal(resultado.toString());

            // El estudiante no debe pasar por caja
            if (montoCaja.compareTo(BigDecimal.ZERO) > 0) {
                throw new IllegalStateException(
                        "Fondo insuficiente para cubrir los S/ 50");
            }

            // 10. Cobertura completa: pasa a triaje
            guardada.setEstado(EstadoCita.TRIAJE);
            citaRepository.save(guardada);

            // Actualizar el saldo en memoria
            entityManager.refresh(paciente);
        }

        // 11. Devolver cita registrada
        return convertirADTO(guardada);
    }


    @Override
    @Transactional
    public Optional<CitaResponseDTO> actualizar(
            Long id,
            CitaDTO dto) {

        Optional<Cita> cita = citaRepository.findById(id);

        if (cita.isPresent()) {

            Cita citaActual = cita.get();

            // 1. No modificar citas finalizadas
            if (citaActual.getEstado() == EstadoCita.ATENDIDO
                    || citaActual.getEstado() == EstadoCita.ANULADO
                    || citaActual.getEstado() == EstadoCita.INASISTENCIA
                    || citaActual.getEstado() == EstadoCita.DERIVADO) {

                throw new RuntimeException(
                        "No se puede modificar una cita finalizada");
            }

            // 2. Actualizar fecha y hora
            if (dto.fechaCita() != null) {
                citaActual.setFechaCita(dto.fechaCita());
            }

            if (dto.horaCita() != null) {
                citaActual.setHoraCita(dto.horaCita());
            }

            // 3. Actualizar notificación
            if (dto.notificacion() != null) {
                citaActual.setNotificacion(dto.notificacion());
            }

            // 4. Actualizar signos vitales
            if (dto.temperatura() != null) {
                citaActual.setTemperatura(dto.temperatura());
            }

            if (dto.presion() != null) {
                citaActual.setPresion(dto.presion());
            }

            if (dto.frecuenciaCardiaca() != null) {
                citaActual.setFrecuenciaCardiaca(dto.frecuenciaCardiaca());
            }

            if (dto.frecuenciaRespiratoria() != null) {
                citaActual.setFrecuenciaRespiratoria(dto.frecuenciaRespiratoria());
            }

            if (dto.peso() != null) {
                citaActual.setPeso(dto.peso());
            }

            if (dto.talla() != null) {
                citaActual.setTalla(dto.talla());
            }

            // 5. Actualizar información médica
            if (dto.motivoConsulta() != null) {
                citaActual.setMotivoConsulta(dto.motivoConsulta());
            }

            if (dto.diagnostico() != null) {
                citaActual.setDiagnostico(dto.diagnostico());
            }

            if (dto.tratamiento() != null) {
                citaActual.setTratamiento(dto.tratamiento());
            }

            if (dto.observaciones() != null) {
                citaActual.setObservaciones(dto.observaciones());
            }

            if (dto.indicaciones() != null) {
                citaActual.setIndicaciones(dto.indicaciones());
            }

            // 6. Actualizar paciente
            if (dto.idPersona() != null) {

                Persona paciente = personaRepository.findById(dto.idPersona())
                        .orElseThrow(() ->
                                new RuntimeException("Paciente no encontrado"));

                citaActual.setPersona(paciente);
            }

            // 7. Actualizar médico
            if (dto.idMedico() != null) {

                Medico medico = medicoRepository.findById(dto.idMedico())
                        .orElseThrow(() ->
                                new RuntimeException("Médico no encontrado"));

                citaActual.setMedico(medico);
            }

            // 8. Actualizar empleado
            if (dto.idEmpleado() != null) {

                Empleado empleado = empleadoRepository.findById(dto.idEmpleado())
                        .orElseThrow(() ->
                                new RuntimeException("Empleado no encontrado"));

                citaActual.setEmpleado(empleado);
            }

            // 9. Validar cambios de estado
            if (dto.estado() != null) {

                EstadoCita nuevoEstado = dto.estado();
                EstadoCita estadoActual = citaActual.getEstado();

                // No permitir saltarse el pago
                if (estadoActual == EstadoCita.RECEPCION
                        && (nuevoEstado == EstadoCita.TRIAJE
                        || nuevoEstado == EstadoCita.ATENDIDO)) {

                    throw new RuntimeException(
                            "Debe completar el pago o la cobertura del fondo antes de continuar");
                }

                // No permitir atender sin pasar por triaje
                if (nuevoEstado == EstadoCita.ATENDIDO
                        && estadoActual != EstadoCita.TRIAJE) {

                    throw new RuntimeException(
                            "La cita debe pasar por triaje antes de ser atendida");
                }

                // Validar diagnóstico y tratamiento
                if (nuevoEstado == EstadoCita.ATENDIDO) {

                    if (citaActual.getDiagnostico() == null
                            || citaActual.getDiagnostico().isBlank()
                            || citaActual.getTratamiento() == null
                            || citaActual.getTratamiento().isBlank()) {

                        throw new RuntimeException(
                                "Debe registrar diagnóstico y tratamiento para atender la cita");
                    }
                }

                citaActual.setEstado(nuevoEstado);
            }

            // 10. Guardar cambios
            Cita actualizada = citaRepository.save(citaActual);

            return Optional.of(convertirADTO(actualizada));
        }

        return Optional.empty();
    }


    // ==================================
    // ANULAR CITA
    // ==================================

    @Override
    @Transactional
    public boolean anular(Long id) {

        Optional<Cita> cita =
                citaRepository.findById(id);

        if (cita.isPresent()) {

            Cita citaActual = cita.get();

            if (citaActual.getEstado() == EstadoCita.ATENDIDO
                    || citaActual.getEstado() == EstadoCita.ANULADO
                    || citaActual.getEstado() == EstadoCita.INASISTENCIA
                    || citaActual.getEstado() == EstadoCita.DERIVADO) {

                throw new RuntimeException(
                        "La cita no puede ser anulada");
            }

            LocalDate fecha = citaActual.getFechaCita();
            LocalTime hora = LocalTime.parse(
                    citaActual.getHoraCita()
            );

            if (fecha.isBefore(LocalDate.now())
                    || (fecha.isEqual(LocalDate.now())
                    && !hora.isAfter(LocalTime.now()))) {

                throw new RuntimeException(
                        "La cita ya pasó y no puede ser anulada");
            }

            citaActual.setEstado(EstadoCita.ANULADO);

            citaRepository.save(citaActual);

            return true;
        }

        return false;
    }

    // ==================================
    // VALIDAR PACIENTE
    // ==================================

    private void validarPaciente(Persona paciente) {

        if (paciente.getTipoPersona() == TipoPersona.EMPLEADO) {

            throw new RuntimeException(
                    "La persona seleccionada no está registrada como paciente");
        }

        if (paciente.getTipoPaciente() == null) {

            throw new RuntimeException(
                    "Debe registrar el tipo de paciente");
        }
    }

    // ==================================
    // VALIDAR FECHA Y HORA
    // ==================================

    private void validarFechaHora(
            LocalDate fecha,
            String horaCita) {

        if (fecha.isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "No se puede reservar una fecha anterior a hoy");
        }

        LocalTime hora;

        try {
            hora = LocalTime.parse(horaCita);
        } catch (Exception e) {
            throw new RuntimeException(
                    "La hora debe tener formato HH:mm");
        }

        if (fecha.isEqual(LocalDate.now())
                && !hora.isAfter(LocalTime.now())) {

            throw new RuntimeException(
                    "La hora de la cita debe ser posterior a la hora actual");
        }
    }

    // ==================================
    // VALIDAR HORARIO DEL MEDICO
    // ==================================

    private void validarHorario(
            Long idMedico,
            LocalDate fecha,
            String horaCita) {

        String diaNombre = fecha.getDayOfWeek().name();

        switch (diaNombre) {
            case "MONDAY":
                diaNombre = "LUNES";
                break;
            case "TUESDAY":
                diaNombre = "MARTES";
                break;
            case "WEDNESDAY":
                diaNombre = "MIERCOLES";
                break;
            case "THURSDAY":
                diaNombre = "JUEVES";
                break;
            case "FRIDAY":
                diaNombre = "VIERNES";
                break;
            case "SATURDAY":
                diaNombre = "SABADO";
                break;
            case "SUNDAY":
                diaNombre = "DOMINGO";
                break;
        }

        DiaSemana dia = DiaSemana.valueOf(diaNombre);

        List<HorarioMedico> horarios =
                horarioMedicoRepository
                        .findByMedicoIdEmpleadoAndDiaSemana(
                                idMedico,
                                dia
                        );

        LocalTime hora = LocalTime.parse(horaCita);

        boolean horarioValido = false;

        for (HorarioMedico h : horarios) {

            if (h.getEstado() != null
                    && h.getEstado().name().equals("ACTIVO")) {

                LocalTime inicio =
                        LocalTime.parse(h.getHoraInicio());

                LocalTime fin =
                        LocalTime.parse(h.getHoraFin());

                if (!hora.isBefore(inicio)
                        && hora.isBefore(fin)) {

                    horarioValido = true;
                }
            }
        }

        if (!horarioValido) {

            throw new RuntimeException(
                    "El médico no tiene horario disponible para esa fecha y hora");
        }
    }

    // ==================================
    // VALIDAR CITA DUPLICADA
    // ==================================

    private void validarCitaDuplicada(
            Long idMedico,
            LocalDate fecha,
            String hora,
            Long idCitaActual) {

        List<Cita> lista =
                citaRepository.findByMedicoIdEmpleado(idMedico);

        for (Cita c : lista) {

            if (idCitaActual != null
                    && c.getIdCita().equals(idCitaActual)) {
                continue;
            }

            if (c.getFechaCita().equals(fecha)
                    && c.getHoraCita().equals(hora)
                    && c.getEstado() != EstadoCita.ANULADO) {

                throw new RuntimeException(
                        "El médico ya tiene una cita reservada en esa fecha y hora");
            }
        }
    }

    // ==================================
    // CONVERTIR ENTIDAD A DTO
    // ==================================

    private CitaResponseDTO convertirADTO(Cita c) {

        String paciente = "";
        String medico = "";
        String empleadoTriaje = "";
        Long idPersona = null;
        String dniPaciente = "";

        if (c.getPersona() != null) {
            idPersona = c.getPersona().getIdPersona();
            dniPaciente = c.getPersona().getDni();
            paciente = c.getPersona().getNombres()
                    + " "
                    + c.getPersona().getApellidos();
        }

        if (c.getMedico() != null
                && c.getMedico().getEmpleado() != null
                && c.getMedico().getEmpleado().getPersona() != null) {

            medico = c.getMedico().getEmpleado()
                    .getPersona().getNombres()
                    + " "
                    + c.getMedico().getEmpleado()
                    .getPersona().getApellidos();
        }

        if (c.getEmpleado() != null
                && c.getEmpleado().getPersona() != null) {

            empleadoTriaje =
                    c.getEmpleado().getPersona().getNombres()
                            + " "
                            + c.getEmpleado().getPersona().getApellidos();
        }

        return new CitaResponseDTO(
                c.getIdCita(),
                c.getFechaCita(),
                c.getHoraCita(),
                c.getNotificacion(),
                c.getTemperatura(),
                c.getPresion(),
                c.getFrecuenciaCardiaca(),
                c.getFrecuenciaRespiratoria(),
                c.getPeso(),
                c.getTalla(),
                c.getMotivoConsulta(),
                c.getDiagnostico(),
                c.getTratamiento(),
                c.getObservaciones(),
                c.getIndicaciones(),
                c.getEstado(),
                paciente,
                medico,
                empleadoTriaje,
                idPersona,
                dniPaciente
        );
    }
}