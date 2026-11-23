package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import pe.edu.upeu.centromedico.centro_medico.security.UsuarioPrincipal;

import pe.edu.upeu.centromedico.centro_medico.dto.CitaDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.CitaResponseDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.MedicoProductividadDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.ReprogramarCitaDTO;

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

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

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

        Optional<Cita> resultado = citaRepository.findById(id);

        if (resultado.isEmpty()) {
            return Optional.empty();
        }

        Cita cita = resultado.get();

        // NUEVO: verificar que la cita sea del médico.
        verificarCitaDelMedico(cita);

        return Optional.of(convertirADTO(cita));
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
    // LISTAR ULTIMA CITA POR PACIENTE
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

    // ==================================
    // TRIAJE: CITAS CON SIGNOS CRITICOS
    // ==================================

    @Override
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> listarCitasCriticas(
            BigDecimal tempLimite,
            BigDecimal presionLimite) {

        BigDecimal temp = (tempLimite != null)
                ? tempLimite
                : new BigDecimal("38.0");

        BigDecimal pres = (presionLimite != null)
                ? presionLimite
                : new BigDecimal("120.0");

        List<Cita> lista =
                citaRepository.findCitasConSignosCriticos(temp, pres);

        List<CitaResponseDTO> respuesta = new ArrayList<>();

        for (Cita c : lista) {
            respuesta.add(convertirADTO(c));
        }

        return respuesta;
    }

    // ==================================
    // PRODUCTIVIDAD MEDICA
    // ==================================

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

    // ==================================
    // CREAR CITA
    // ==================================

    @Override
    @Transactional
    public CitaResponseDTO crear(CitaDTO dto) {

        // 1. Validar datos obligatorios

        if (dto.idPersona() == null) {
            throw new RuntimeException(
                    "El paciente es obligatorio"
            );
        }

        if (dto.fechaCita() == null || dto.horaCita() == null) {
            throw new RuntimeException(
                    "La fecha y hora son obligatorias"
            );
        }

        if (dto.motivoConsulta() == null ||
                dto.motivoConsulta().isBlank()) {

            throw new RuntimeException(
                    "El motivo de consulta es obligatorio"
            );
        }

        // 2. Buscar paciente

        Persona paciente =
                personaRepository.findById(dto.idPersona())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Paciente no encontrado"
                                )
                        );

        validarPaciente(paciente);

        // 3. Crear cita

        Cita cita = new Cita();

        cita.setFechaCita(dto.fechaCita());
        cita.setHoraCita(dto.horaCita());

        cita.setNotificacion(
                dto.notificacion() == null
                        ? "N"
                        : dto.notificacion()
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

        // 4. Asignar medico

        if (dto.idMedico() != null) {

            Medico medico =
                    medicoRepository.findById(dto.idMedico())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Médico no encontrado"
                                    )
                            );

            // Serializa las reservas del mismo medico dentro de la transaccion.
            // Asi dos solicitudes simultaneas no pueden reservar el mismo turno.
            entityManager.lock(medico, LockModeType.PESSIMISTIC_WRITE);

            if (dto.estado() != EstadoCita.DERIVADO) {
                validarFechaHora(dto.fechaCita(), dto.horaCita());
                validarHorario(dto.idMedico(), dto.fechaCita(), dto.horaCita());
            }

            validarCitaDuplicada(
                    dto.idMedico(), dto.fechaCita(), dto.horaCita(), null
            );

            cita.setMedico(medico);
        } else if (dto.estado() != EstadoCita.DERIVADO) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar un medico para reservar la cita"
            );
        }

        // 5. Asignar empleado de triaje

        if (dto.idEmpleado() != null) {

            Empleado empleado =
                    empleadoRepository.findById(dto.idEmpleado())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Empleado no encontrado"
                                    )
                            );

            cita.setEmpleado(empleado);
        }

        // 6. Determinar estado inicial

        if (dto.estado() == EstadoCita.DERIVADO) {
            cita.setEstado(EstadoCita.DERIVADO);
        } else {
            cita.setEstado(EstadoCita.RECEPCION);
        }

        // 7. Registrar cita y obtener ID

        Cita guardada =
                citaRepository.saveAndFlush(cita);

        // ==========================================
        // COBERTURA AUTOMATICA DEL FONDO ESTUDIANTIL
        // ==========================================

        BigDecimal precioCita =
                new BigDecimal("50.00");

        BigDecimal saldoActual =
                paciente.getSaldoFondo() != null
                        ? paciente.getSaldoFondo()
                        : BigDecimal.ZERO;

        // Estudiante con matricula vigente y fondo suficiente

        if (dto.estado() != EstadoCita.DERIVADO
                && paciente.getTipoPaciente() == TipoPaciente.ESTUDIANTE
                && paciente.getMatriculaVigente() == SiNo.SI
                && saldoActual.compareTo(precioCita) >= 0) {

            StoredProcedureQuery procedimiento =
                    entityManager.createStoredProcedureQuery(
                            "CENTRO_MEDICO.SP_DESCONTAR_FONDO_ESTUDIANTIL"
                    );

            procedimiento.registerStoredProcedureParameter(
                    1,
                    Long.class,
                    ParameterMode.IN
            );

            procedimiento.registerStoredProcedureParameter(
                    2,
                    BigDecimal.class,
                    ParameterMode.OUT
            );

            procedimiento.registerStoredProcedureParameter(
                    3,
                    BigDecimal.class,
                    ParameterMode.OUT
            );

            procedimiento.setParameter(
                    1,
                    guardada.getIdCita()
            );

            procedimiento.execute();

            Number resultado =
                    (Number) procedimiento.getOutputParameterValue(3);

            BigDecimal montoCaja =
                    new BigDecimal(resultado.toString());

            if (montoCaja.compareTo(BigDecimal.ZERO) != 0) {

                throw new IllegalStateException(
                        "No se pudo confirmar la cobertura completa del fondo"
                );
            }

            // Cobertura completa: pasa directamente a triaje

            guardada.setEstado(EstadoCita.TRIAJE);

            citaRepository.save(guardada);

            // Actualizar saldo del estudiante

            entityManager.refresh(paciente);
        }

        // Los estudiantes sin cobertura completa
        // permanecen en RECEPCION para caja.

        return convertirADTO(guardada);
    }

    // ==================================
    // ACTUALIZAR CITA
    // ==================================

    @Override
    @Transactional
    public Optional<CitaResponseDTO> actualizar(
            Long id,
            CitaDTO dto) {

        Optional<Cita> cita = citaRepository.findById(id);

        if (cita.isPresent()) {

            Cita citaActual = cita.get();

            // NUEVO: verificar pertenencia al médico.
            verificarCitaDelMedico(citaActual);

            // 1. No modificar citas finalizadas

            if (citaActual.getEstado() == EstadoCita.ATENDIDO
                    || citaActual.getEstado() == EstadoCita.ANULADO
                    || citaActual.getEstado() == EstadoCita.INASISTENCIA
                    || citaActual.getEstado() == EstadoCita.DERIVADO) {

                throw new RuntimeException(
                        "No se puede modificar una cita finalizada"
                );
            }

            // ================================================
            // VALIDACION: LA ATENCION Y EL TRIAJE SOLO EL DIA
            // PROGRAMADO DE LA CITA (HORA LOCAL DE PERU).
            // Se valida la fecha YA GUARDADA, antes de cualquier
            // posible modificacion recibida en el DTO.
            // ================================================

            boolean modificaDatosClinicos =
                    dto.temperatura() != null
                            || dto.presion() != null
                            || dto.frecuenciaCardiaca() != null
                            || dto.frecuenciaRespiratoria() != null
                            || dto.peso() != null
                            || dto.talla() != null
                            || dto.diagnostico() != null
                            || dto.tratamiento() != null
                            || dto.observaciones() != null
                            || dto.indicaciones() != null
                            || dto.estado() == EstadoCita.ATENDIDO;

            if (modificaDatosClinicos) {

                LocalDate fechaProgramada = citaActual.getFechaCita();
                LocalDate hoyPeru = LocalDate.now(
                        ZoneId.of("America/Lima")
                );

                if (fechaProgramada == null
                        || !fechaProgramada.equals(hoyPeru)) {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "La atencion y el triaje solo pueden registrarse "
                                    + "el dia programado de la cita: "
                                    + fechaProgramada
                    );
                }

                // No permitir cambiar fecha/hora en la misma
                // peticion que registra datos clinicos.
                if ((dto.fechaCita() != null
                        && !dto.fechaCita().equals(fechaProgramada))
                        || (dto.horaCita() != null
                        && !dto.horaCita().equals(citaActual.getHoraCita()))) {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "No se puede cambiar la fecha u hora "
                                    + "al registrar una atencion o triaje"
                    );
                }
            }

            // El personal clinico no puede adelantar citas con PUT.
            // Para cambiar una cita debe usarse la reprogramacion.
            Authentication autenticacion = SecurityContextHolder
                    .getContext().getAuthentication();

            boolean personalClinico = autenticacion != null
                    && autenticacion.getAuthorities().stream()
                    .anyMatch(a -> "MEDICO".equals(a.getAuthority())
                            || "TRIAJE".equals(a.getAuthority()));

            if (personalClinico
                    && ((dto.fechaCita() != null
                    && !dto.fechaCita().equals(citaActual.getFechaCita()))
                    || (dto.horaCita() != null
                    && !dto.horaCita().equals(citaActual.getHoraCita())))) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "La fecha y la hora solo pueden modificarse "
                                + "mediante la reprogramacion de citas"
                );
            }

            // Si ADMIN modifica el turno con PUT, tampoco puede duplicarlo.
            // Las actualizaciones de datos clinicos sin cambio de turno siguen igual.
            Long medicoActual = citaActual.getMedico() == null
                    ? null : citaActual.getMedico().getIdEmpleado();
            Long medicoNuevo = dto.idMedico() == null
                    ? medicoActual : dto.idMedico();
            LocalDate fechaNueva = dto.fechaCita() == null
                    ? citaActual.getFechaCita() : dto.fechaCita();
            String horaNueva = dto.horaCita() == null
                    ? citaActual.getHoraCita() : dto.horaCita();

            boolean cambiaTurno =
                    !Objects.equals(medicoActual, medicoNuevo)
                            || !Objects.equals(citaActual.getFechaCita(), fechaNueva)
                            || !mismaHora(citaActual.getHoraCita(), horaNueva);

            if (cambiaTurno) {
                if (medicoNuevo == null) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Debe seleccionar un medico para cambiar el turno"
                    );
                }

                Medico medicoBloqueado = medicoRepository.findById(medicoNuevo)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Medico no encontrado"
                        ));
                entityManager.lock(medicoBloqueado, LockModeType.PESSIMISTIC_WRITE);

                validarFechaHora(fechaNueva, horaNueva);
                validarHorario(medicoNuevo, fechaNueva, horaNueva);
                validarCitaDuplicada(medicoNuevo, fechaNueva, horaNueva, id);
            }

            // 2. Actualizar fecha y hora

            if (dto.fechaCita() != null) {
                citaActual.setFechaCita(dto.fechaCita());
            }

            if (dto.horaCita() != null) {
                citaActual.setHoraCita(dto.horaCita());
            }

            // 3. Actualizar notificacion

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
                citaActual.setFrecuenciaCardiaca(
                        dto.frecuenciaCardiaca()
                );
            }

            if (dto.frecuenciaRespiratoria() != null) {
                citaActual.setFrecuenciaRespiratoria(
                        dto.frecuenciaRespiratoria()
                );
            }

            if (dto.peso() != null) {
                citaActual.setPeso(dto.peso());
            }

            if (dto.talla() != null) {
                citaActual.setTalla(dto.talla());
            }

            // 5. Actualizar informacion medica

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

                Persona paciente =
                        personaRepository.findById(dto.idPersona())
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Paciente no encontrado"
                                        )
                                );

                citaActual.setPersona(paciente);
            }

            // 7. Actualizar medico

            if (dto.idMedico() != null) {

                Medico medico =
                        medicoRepository.findById(dto.idMedico())
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Médico no encontrado"
                                        )
                                );

                citaActual.setMedico(medico);
            }

            // 8. Actualizar empleado

            if (dto.idEmpleado() != null) {

                Empleado empleado =
                        empleadoRepository.findById(dto.idEmpleado())
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Empleado no encontrado"
                                        )
                                );

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
                            "Debe completar el pago o la cobertura del fondo antes de continuar"
                    );
                }

                // No permitir atender sin pasar por triaje

                if (nuevoEstado == EstadoCita.ATENDIDO
                        && estadoActual != EstadoCita.TRIAJE) {

                    throw new RuntimeException(
                            "La cita debe pasar por triaje antes de ser atendida"
                    );
                }

                // Validar diagnostico y tratamiento

                if (nuevoEstado == EstadoCita.ATENDIDO) {

                    if (citaActual.getDiagnostico() == null
                            || citaActual.getDiagnostico().isBlank()
                            || citaActual.getTratamiento() == null
                            || citaActual.getTratamiento().isBlank()) {

                        throw new RuntimeException(
                                "Debe registrar diagnóstico y tratamiento para atender la cita"
                        );
                    }
                }

                citaActual.setEstado(nuevoEstado);
            }

            // 10. Guardar cambios

            Cita actualizada =
                    citaRepository.save(citaActual);

            return Optional.of(
                    convertirADTO(actualizada)
            );
        }

        return Optional.empty();
    }

    // ==================================
    // ANULAR CITA
    // ==================================

    @Override
    @Transactional
    public boolean anular(Long id) {

        if (!citaRepository.existsById(id)) {
            return false;
        }

        StoredProcedureQuery procedimiento =
                entityManager.createStoredProcedureQuery(
                        "CENTRO_MEDICO.SP_ANULAR_CITA"
                );

        procedimiento.registerStoredProcedureParameter(
                1,
                Long.class,
                ParameterMode.IN
        );

        procedimiento.setParameter(1, id);

        procedimiento.execute();

        return true;
    }

    // ==================================
    // REPROGRAMAR CITA
    // ==================================

    @Override
    @Transactional
    public Optional<CitaResponseDTO> reprogramar(
            Long id,
            ReprogramarCitaDTO dto) {

        // 1. Buscar cita

        Optional<Cita> resultado =
                citaRepository.findById(id);

        if (resultado.isEmpty()) {
            return Optional.empty();
        }

        Cita cita = resultado.get();

        // 2. Validar estado

        if (cita.getEstado() != EstadoCita.RECEPCION
                && cita.getEstado() != EstadoCita.TRIAJE) {

            throw new IllegalStateException(
                    "La cita no puede ser reprogramada"
            );
        }

        // 3. Validar fecha original

        validarFechaHora(
                cita.getFechaCita(),
                cita.getHoraCita()
        );

        // 4. Validar nueva fecha

        validarFechaHora(
                dto.fechaCita(),
                dto.horaCita()
        );

        // 5. Verificar medico asignado

        if (cita.getMedico() == null) {

            throw new IllegalStateException(
                    "La cita no tiene medico asignado"
            );
        }

        Long idMedico =
                cita.getMedico().getIdEmpleado();

        // Bloquear el medico para evitar reprogramaciones simultaneas
        // que ocupen el mismo horario.
        entityManager.lock(cita.getMedico(), LockModeType.PESSIMISTIC_WRITE);

        // 6. Validar horario

        validarHorario(
                idMedico,
                dto.fechaCita(),
                dto.horaCita()
        );

        // 7. Evitar horarios duplicados

        validarCitaDuplicada(
                idMedico,
                dto.fechaCita(),
                dto.horaCita(),
                id
        );

        // 8. Cambiar fecha y hora

        cita.setFechaCita(dto.fechaCita());
        cita.setHoraCita(dto.horaCita());

        // 9. Guardar sin modificar estado ni fondo

        Cita guardada =
                citaRepository.save(cita);

        return Optional.of(
                convertirADTO(guardada)
        );
    }

    // ==========================================
    // NUEVO: VERIFICAR CITA ASIGNADA AL MEDICO
    // ==========================================

    private void verificarCitaDelMedico(Cita cita) {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debe iniciar sesión"
            );
        }

        boolean esMedico =
                auth.getAuthorities()
                        .stream()
                        .anyMatch(a ->
                                "MEDICO".equals(
                                        a.getAuthority()
                                )
                        );

        // Para ADMIN y TRIAJE se mantiene
        // el comportamiento previo.
        if (!esMedico) {
            return;
        }

        if (!(auth.getPrincipal() instanceof UsuarioPrincipal principal)
                || principal.usuario().getPersona() == null) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No se pudo identificar al médico"
            );
        }

        if (cita.getMedico() == null
                || cita.getMedico().getEmpleado() == null
                || cita.getMedico().getEmpleado().getPersona() == null) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cita no tiene un médico válido asignado"
            );
        }

        Long idPersonaAutenticada =
                principal.usuario()
                        .getPersona()
                        .getIdPersona();

        Long idPersonaMedicoAsignado =
                cita.getMedico()
                        .getEmpleado()
                        .getPersona()
                        .getIdPersona();

        if (!idPersonaAutenticada.equals(
                idPersonaMedicoAsignado
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta cita pertenece a otro médico"
            );
        }
    }

    // ==================================
    // VALIDAR PACIENTE
    // ==================================

    private void validarPaciente(Persona paciente) {

        if (paciente.getTipoPersona() == TipoPersona.EMPLEADO) {

            throw new RuntimeException(
                    "La persona seleccionada no está registrada como paciente"
            );
        }

        if (paciente.getTipoPaciente() == null) {

            throw new RuntimeException(
                    "Debe registrar el tipo de paciente"
            );
        }
    }

    // ==================================
    // VALIDAR FECHA Y HORA
    // ==================================

    private void validarFechaHora(
            LocalDate fecha,
            String horaCita) {

        LocalDate hoyPeru = LocalDate.now(ZoneId.of("America/Lima"));
        LocalTime horaActualPeru = LocalTime.now(ZoneId.of("America/Lima"));

        if (fecha == null || fecha.isBefore(hoyPeru)) {

            throw new RuntimeException(
                    "No se puede reservar una fecha anterior a hoy"
            );
        }

        LocalTime hora;

        try {

            hora = LocalTime.parse(horaCita);

        } catch (Exception e) {

            throw new RuntimeException(
                    "La hora debe tener formato HH:mm"
            );
        }

        if (fecha.isEqual(hoyPeru)
                && !hora.isAfter(horaActualPeru)) {

            throw new RuntimeException(
                    "La hora de la cita debe ser posterior a la hora actual"
            );
        }
    }

    // ==================================
    // VALIDAR HORARIO DEL MEDICO
    // ==================================

    private void validarHorario(
            Long idMedico,
            LocalDate fecha,
            String horaCita) {

        String diaNombre =
                fecha.getDayOfWeek().name();

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

        DiaSemana dia =
                DiaSemana.valueOf(diaNombre);

        List<HorarioMedico> horarios =
                horarioMedicoRepository
                        .findByMedicoIdEmpleadoAndDiaSemana(
                                idMedico,
                                dia
                        );

        LocalTime hora =
                LocalTime.parse(horaCita);

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

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El médico no tiene horario disponible para esa fecha y hora"
            );
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

            if (Objects.equals(c.getFechaCita(), fecha)
                    && mismaHora(c.getHoraCita(), hora)
                    && c.getEstado() != EstadoCita.ANULADO) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El médico ya tiene una cita reservada en esa fecha y hora"
                );
            }
        }
    }

    // Comparar horas aunque vengan como HH:mm o HH:mm:ss.
    private boolean mismaHora(String primera, String segunda) {
        if (primera == null || segunda == null) {
            return Objects.equals(primera, segunda);
        }
        try {
            return LocalTime.parse(primera).equals(LocalTime.parse(segunda));
        } catch (Exception ex) {
            return primera.equals(segunda);
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

            idPersona =
                    c.getPersona().getIdPersona();

            dniPaciente =
                    c.getPersona().getDni();

            paciente =
                    c.getPersona().getNombres()
                            + " "
                            + c.getPersona().getApellidos();
        }

        if (c.getMedico() != null
                && c.getMedico().getEmpleado() != null
                && c.getMedico().getEmpleado().getPersona() != null) {

            medico =
                    c.getMedico()
                            .getEmpleado()
                            .getPersona()
                            .getNombres()
                            + " "
                            + c.getMedico()
                            .getEmpleado()
                            .getPersona()
                            .getApellidos();
        }

        if (c.getEmpleado() != null
                && c.getEmpleado().getPersona() != null) {

            empleadoTriaje =
                    c.getEmpleado()
                            .getPersona()
                            .getNombres()
                            + " "
                            + c.getEmpleado()
                            .getPersona()
                            .getApellidos();
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
