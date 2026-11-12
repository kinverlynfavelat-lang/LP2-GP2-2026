package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.centromedico.centro_medico.dto.PagoDTO;
import pe.edu.upeu.centromedico.centro_medico.dto.ResumenPagoDTO;
import pe.edu.upeu.centromedico.centro_medico.entity.Cita;
import pe.edu.upeu.centromedico.centro_medico.entity.Pago;
import pe.edu.upeu.centromedico.centro_medico.entity.Persona;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoCita;
import pe.edu.upeu.centromedico.centro_medico.enums.SiNo;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPaciente;
import pe.edu.upeu.centromedico.centro_medico.exceptions.ResourceNotFoundException;
import pe.edu.upeu.centromedico.centro_medico.repository.CitaRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.PagoRepository;
import pe.edu.upeu.centromedico.centro_medico.repository.PersonaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PagoServiceImpl implements IPagoService {

    private final PagoRepository pagoRepository;
    private final CitaRepository citaRepository;
    private final PersonaRepository personaRepository;
    @PersistenceContext
    private EntityManager entityManager;

    private static final BigDecimal PRECIO_CITA =
            new BigDecimal("50.00");

    public PagoServiceImpl(
            PagoRepository pagoRepository,
            CitaRepository citaRepository,
            PersonaRepository personaRepository) {

        this.pagoRepository = pagoRepository;
        this.citaRepository = citaRepository;
        this.personaRepository = personaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoDTO> listarTodo() {

        return pagoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PagoDTO> buscarPorId(Long id) {

        return pagoRepository.findById(id)
                .map(this::convertirADTO);
    }

    // ===================================================
    // CAJA / PAGOS Reporte de ingresos por medio de pago
    // ===================================================

    @Override
    @Transactional(readOnly = true)
    public List<ResumenPagoDTO> obtenerResumenPorMedioPago() {

        return pagoRepository.obtenerResumenPorMedioPago();
    }

    @Override
    @Transactional
    public String registrarPago(PagoDTO dto) {

        // 1. Validar datos iniciales
        if (dto == null || dto.idCita() == null) {
            throw new IllegalArgumentException(
                    "Debe indicar la cita");
        }

        // 2. Buscar cita
        Cita cita = citaRepository.findById(dto.idCita())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cita no encontrada"));

        // 3. Validar estado
        if (cita.getEstado() != EstadoCita.RECEPCION) {
            throw new IllegalStateException(
                    "La cita no está pendiente de pago");
        }

        // 4. Evitar pagos duplicados
        if (pagoRepository.existsById(cita.getIdCita())) {
            throw new IllegalStateException(
                    "La cita ya tiene un pago registrado");
        }

        if (cita.getPersona() == null) {
            throw new ResourceNotFoundException(
                    "Persona no encontrada en la cita");
        }

        // 5. Llamar al procedimiento almacenado Oracle
        StoredProcedureQuery procedimiento =
                entityManager.createStoredProcedureQuery(
                        "SP_DESCONTAR_FONDO_ESTUDIANTIL");

        procedimiento.registerStoredProcedureParameter(
                1, Long.class, ParameterMode.IN);

        procedimiento.registerStoredProcedureParameter(
                2, BigDecimal.class, ParameterMode.OUT);

        procedimiento.registerStoredProcedureParameter(
                3, BigDecimal.class, ParameterMode.OUT);

        procedimiento.setParameter(1, cita.getIdCita());

        procedimiento.execute();

        // 6. Obtener descuento y monto pendiente
        Number resultadoDescuento =
                (Number) procedimiento.getOutputParameterValue(2);

        Number resultadoCaja =
                (Number) procedimiento.getOutputParameterValue(3);

        BigDecimal descuentoFondo =
                new BigDecimal(resultadoDescuento.toString());

        BigDecimal montoPagar =
                new BigDecimal(resultadoCaja.toString());

        // 7. Registrar pago en caja si corresponde
        if (montoPagar.compareTo(BigDecimal.ZERO) > 0) {

            if (dto.fecha() == null
                    || dto.motivoPago() == null
                    || dto.motivoPago().isBlank()
                    || dto.medioPago() == null) {

                throw new IllegalArgumentException(
                        "Debe completar los datos del pago");
            }

            Pago pago = new Pago();

            pago.setCita(cita);
            pago.setFecha(dto.fecha());
            pago.setMotivoPago(dto.motivoPago());
            pago.setMonto(montoPagar);
            pago.setMedioPago(dto.medioPago());

            pagoRepository.save(pago);
        }

        // 8. Pasar a triaje
        cita.setEstado(EstadoCita.TRIAJE);
        citaRepository.save(cita);

        // 9. Mensaje de respuesta
        if (montoPagar.compareTo(BigDecimal.ZERO) == 0) {

            return "Atención cubierta completamente con el fondo universitario. "
                    + "Descuento: S/ " + descuentoFondo
                    + ". No necesita pasar por caja.";
        }

        return "Proceso completado correctamente. "
                + "Descuento del fondo: S/ " + descuentoFondo
                + ". Pago en caja: S/ " + montoPagar;
    }


    private PagoDTO convertirADTO(Pago pago) {

        return new PagoDTO(
                pago.getIdCita(),
                pago.getFecha(),
                pago.getMotivoPago(),
                pago.getMonto(),
                pago.getMedioPago()
        );
    }
}