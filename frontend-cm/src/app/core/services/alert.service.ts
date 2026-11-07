
import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  // Confirmar una acción
  async confirm(mensaje: string): Promise<boolean> {
    const resultado = await Swal.fire({
      title: '¿Estás seguro?',
      text: mensaje,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#329BC2',
      cancelButtonColor: '#6C757D'
    });

    return resultado.isConfirmed;
  }

  // Mensaje de éxito
  success(mensaje: string) {
    Swal.fire({
      icon: 'success',
      title: '¡Correcto!',
      text: mensaje,
      confirmButtonColor: '#329BC2'
    });
  }

  // Mensaje de error
  error(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      confirmButtonColor: '#329BC2'
    });
  }

  // Notificación pequeña
  toast(mensaje: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: mensaje,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }

}
