
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import pe.edu.upeu.centromedico.centro_medico.enums.Rol;

@Entity
@Table(name = "USUARIO")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "usuario", length = 200)
    private String usuario;

    @Column(name = "password", length = 200)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", length = 200)
    private Rol rol;

    @OneToOne
    @JoinColumn(name = "id_persona", unique = true)
    private Persona persona;

    public Usuario() {
    }

    public Usuario(Long idUsuario, String usuario, String password, Rol rol, Persona persona) {
        this.idUsuario = idUsuario;
        this.usuario = usuario;
        this.password = password;
        this.rol = rol;
        this.persona = persona;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }
}
