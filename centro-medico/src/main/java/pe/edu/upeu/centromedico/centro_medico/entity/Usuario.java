
package pe.edu.upeu.centromedico.centro_medico.entity;

import jakarta.persistence.*;
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

    public Usuario() {
    }

    public Usuario(Long idUsuario, String usuario, String password, Rol rol) {
        this.idUsuario = idUsuario;
        this.usuario = usuario;
        this.password = password;
        this.rol = rol;
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
}
