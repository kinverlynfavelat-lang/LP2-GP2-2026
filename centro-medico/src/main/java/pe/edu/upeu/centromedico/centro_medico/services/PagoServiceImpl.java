package pe.edu.upeu.centromedico.centro_medico.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.centromedico.centro_medico.dto.PagoDTO;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PagoServiceImpl implements IPagoService {

    private final PagoRepository pagoRepository;
    private final CitaRepository citaRepository;
    private final PersonaRepository personaRepository;

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

    @Override
    @Transactional
    public String registrarPago(PagoDTO dto) {

        // 1. Buscar cita
        Cita cita = citaRepository.findById(dto.idCita())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cita no encontrada"));

        // 2. Verificar que esté en recepción
        if (cita.getEstado() != EstadoCita.RECEPCION) {
            throw new IllegalStateException(
                    "La cita no está pendiente de pago");
        }

        // 3. Evitar pagos duplicados
        if (pagoRepository.existsById(cita.getIdCita())) {
            throw new IllegalStateException(
                    "La cita ya tiene un pago registrado");
        }

        // 4. Buscar persona
        Persona persona = cita.getPersona();

        if (persona == null) {
            throw new ResourceNotFoundException(
                    "Persona no encontrada en la cita");
        }

        BigDecimal descuentoFondo = BigDecimal.ZERO;
        BigDecimal montoPagar = PRECIO_CITA;

        // 5. Verificar si es estudiante con matrícula vigente
        if (persona.getTipoPaciente() == TipoPaciente.ESTUDIANTE
                && persona.getMatriculaVigente() == SiNo.SI) {

            BigDecimal saldo = persona.getSaldoFondo() == null
                    ? BigDecimal.ZERO
                    : persona.getSaldoFondo();

            if (saldo.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalStateException(
                        "El saldo del estudiante no puede ser negativo");
            }

            // Calcular descuento del fondo
            descuentoFondo = saldo.min(PRECIO_CITA);

            // Calcular diferencia pendiente
            montoPagar = PRECIO_CITA.subtract(descuentoFondo);
        }

        // 6. Validar datos si necesita pagar en caja
        if (montoPagar.compareTo(BigDecimal.ZERO) > 0) {

            if (dto.fecha() == null
                    || dto.motivoPago() == null
                    || dto.motivoPago().isBlank()
                    || dto.medioPago() == null) {

                throw new IllegalArgumentException(
                        "Debe completar los datos del pago");
            }
        }

        // 7. Descontar el fondo universitario
        if (descuentoFondo.compareTo(BigDecimal.ZERO) > 0) {

            BigDecimal nuevoSaldo = persona.getSaldoFondo()
                    .subtract(descuentoFondo);

            persona.setSaldoFondo(nuevoSaldo);

            personaRepository.save(persona);
        }

        // 8. Registrar pago solamente si existe un importe por pagar
        if (montoPagar.compareTo(BigDecimal.ZERO) > 0) {

            Pago pago = new Pago();

            pago.setCita(cita);
            pago.setFecha(dto.fecha());
            pago.setMotivoPago(dto.motivoPago());
            pago.setMonto(montoPagar);
            pago.setMedioPago(dto.medioPago());

            pagoRepository.save(pago);
        }

        // 9. Pasar a triaje cuando esté cubierta la atención
        cita.setEstado(EstadoCita.TRIAJE);

        citaRepository.save(cita);

        // 10. Mensaje de respuesta
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