
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoCivil;
import pe.edu.upeu.centromedico.centro_medico.enums.EstadoPersona;
import pe.edu.upeu.centromedico.centro_medico.enums.SiNo;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPaciente;
import pe.edu.upeu.centromedico.centro_medico.enums.TipoPersona;

import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
@Table(name = "PERSONA")
public class Persona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_persona")
    private Long idPersona;

    @Column(name = "dni", length = 8)
    private String dni;

    @Column(name = "nombres", length = 20)
    private String nombres;

    @Column(name = "apellidos", length = 20)
    private String apellidos;

    @Column(name = "correo", length = 100)
    private String correo;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "direccion", length = 100)
    private String direccion;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_civil", length = 20)
    private EstadoCivil estadoCivil;

    @Column(name = "alergias", length = 200)
    private String alergias;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_persona", length = 100)
    private TipoPersona tipoPersona;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_paciente", length = 100)
    private TipoPaciente tipoPaciente;

    @Column(name = "codigo_universitario", length = 100)
    private String codigoUniversitario;

    @Column(name = "saldo_fondo", precision = 6, scale = 2)
    private BigDecimal saldoFondo;

    @Enumerated(EnumType.STRING)
    @Column(name = "matricula_vigente", length = 2)
    private SiNo matriculaVigente;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 100)
    private EstadoPersona estado;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @OneToOne(mappedBy = "persona")
    private Empleado empleado;

    public Persona() {
    }

    public Persona(Long idPersona, String dni, String nombres, String apellidos, String correo, String telefono, String direccion, LocalDate fechaNacimiento, EstadoCivil estadoCivil, String alergias, TipoPersona tipoPersona, TipoPaciente tipoPaciente, String codigoUniversitario, BigDecimal saldoFondo, SiNo matriculaVigente, EstadoPersona estado, Usuario usuario, Empleado empleado) {
        this.idPersona = idPersona;
        this.dni = dni;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.correo = correo;
        this.telefono = telefono;
        this.direccion = direccion;
        this.fechaNacimiento = fechaNacimiento;
        this.estadoCivil = estadoCivil;
        this.alergias = alergias;
        this.tipoPersona = tipoPersona;
        this.tipoPaciente = tipoPaciente;
        this.codigoUniversitario = codigoUniversitario;
        this.saldoFondo = saldoFondo;
        this.matriculaVigente = matriculaVigente;
        this.estado = estado;
        this.usuario = usuario;
        this.empleado = empleado;
    }

    public Long getIdPersona() {
        return idPersona;
    }

    public void setIdPersona(Long idPersona) {
        this.idPersona = idPersona;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public EstadoCivil getEstadoCivil() {
        return estadoCivil;
    }

    public void setEstadoCivil(EstadoCivil estadoCivil) {
        this.estadoCivil = estadoCivil;
    }

    public String getAlergias() {
        return alergias;
    }

    public void setAlergias(String alergias) {
        this.alergias = alergias;
    }

    public TipoPersona getTipoPersona() {
        return tipoPersona;
    }

    public void setTipoPersona(TipoPersona tipoPersona) {
        this.tipoPersona = tipoPersona;
    }

    public TipoPaciente getTipoPaciente() {
        return tipoPaciente;
    }

    public void setTipoPaciente(TipoPaciente tipoPaciente) {
        this.tipoPaciente = tipoPaciente;
    }

    public String getCodigoUniversitario() {
        return codigoUniversitario;
    }

    public void setCodigoUniversitario(String codigoUniversitario) {
        this.codigoUniversitario = codigoUniversitario;
    }

    public BigDecimal getSaldoFondo() {
        return saldoFondo;
    }

    public void setSaldoFondo(BigDecimal saldoFondo) {
        this.saldoFondo = saldoFondo;
    }

    public SiNo getMatriculaVigente() {
        return matriculaVigente;
    }

    public void setMatriculaVigente(SiNo matriculaVigente) {
        this.matriculaVigente = matriculaVigente;
    }

    public EstadoPersona getEstado() {
        return estado;
    }

    public void setEstado(EstadoPersona estado) {
        this.estado = estado;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }
}
