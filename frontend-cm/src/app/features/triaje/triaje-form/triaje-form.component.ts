
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/interfaces/cita.interface';
import { AlertService } from '../../../core/services/alert.service';

type NivelAlerta = 'normal' | 'alerta' | 'critico';

@Component({
  selector: 'app-triaje-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './triaje-form.component.html',
  styleUrl: './triaje-form.component.css'
})
export class TriajeFormComponent implements OnInit {

  private citaService = inject(CitaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertService = inject(AlertService);

  idCita!: number;

  cita: Cita | null = null;

  cargando = false;
  guardando = false;

  temperatura: number | null = null;
  presion: number | null = null;
  frecuenciaCardiaca: number | null = null;
  frecuenciaRespiratoria: number | null = null;

  peso: number | null = null;
  talla: number | null = null;

  motivoEmergencia = '';

  // ALERTAS VISUALES DE SIGNOS VITALES

  // normal  -> verde
  // alerta  -> amarillo (fuera de rango leve)
  // critico -> rojo (fuera de rango importante)

  private tieneValor(valor: number | null): valor is number {
    return valor !== null && valor !== undefined && Number.isFinite(Number(valor)) && Number(valor) > 0;
  }

  estadoTemperatura(): NivelAlerta | null {
    if (!this.tieneValor(this.temperatura)) return null;
    const t = Number(this.temperatura);
    if (t < 35 || t > 38) return 'critico';       // hipotermia / fiebre
    if (t < 36 || t > 37.5) return 'alerta';      // febrícula / temperatura baja
    return 'normal';                              // 36.0 - 37.5 °C
  }

  estadoPresion(): NivelAlerta | null {
    if (!this.tieneValor(this.presion)) return null;
    const p = Number(this.presion);
    if (p > 120) return 'critico';                // presión elevada
    if (p < 90) return 'alerta';                  // presión baja
    return 'normal';                              // 90 - 120 mmHg
  }

  estadoFrecuenciaCardiaca(): NivelAlerta | null {
    if (!this.tieneValor(this.frecuenciaCardiaca)) return null;
    const fc = Number(this.frecuenciaCardiaca);
    if (fc < 50 || fc > 120) return 'critico';
    if (fc < 60 || fc > 100) return 'alerta';
    return 'normal';                              // 60 - 100 lpm
  }

  estadoFrecuenciaRespiratoria(): NivelAlerta | null {
    if (!this.tieneValor(this.frecuenciaRespiratoria)) return null;
    const fr = Number(this.frecuenciaRespiratoria);
    if (fr < 10 || fr > 24) return 'critico';
    if (fr < 12 || fr > 20) return 'alerta';
    return 'normal';                              // 12 - 20 rpm
  }

  textoTemperatura(): string {
    const e = this.estadoTemperatura();
    if (!e) return 'Temperatura corporal';
    const t = Number(this.temperatura);
    if (e === 'normal') return 'Normal (36.0 - 37.5 °C)';
    return t < 36 ? 'Temperatura baja' : (e === 'critico' ? 'Fiebre' : 'Febrícula');
  }

  textoPresion(): string {
    const e = this.estadoPresion();
    if (!e) return 'Presión arterial';
    if (e === 'normal') return 'Normal (90 - 120 mmHg)';
    return e === 'critico' ? 'Presión elevada (> 120 mmHg)' : 'Presión baja (< 90 mmHg)';
  }

  textoFrecuenciaCardiaca(): string {
    const e = this.estadoFrecuenciaCardiaca();
    if (!e) return 'Latidos por minuto';
    if (e === 'normal') return 'Normal (60 - 100 lpm)';
    return Number(this.frecuenciaCardiaca) < 60 ? 'Bradicardia' : 'Taquicardia';
  }

  textoFrecuenciaRespiratoria(): string {
    const e = this.estadoFrecuenciaRespiratoria();
    if (!e) return 'Respiraciones por minuto';
    if (e === 'normal') return 'Normal (12 - 20 rpm)';
    return Number(this.frecuenciaRespiratoria) < 12 ? 'Bradipnea' : 'Taquipnea';
  }

  // ÍNDICE DE MASA CORPORAL (IMC)

  /** La talla se espera en metros (ej. 1.70). */
  tallaFueraDeRango(): boolean {
    return this.tieneValor(this.talla) && (Number(this.talla) < 0.3 || Number(this.talla) > 2.5);
  }

  get imc(): number | null {
    if (!this.tieneValor(this.peso) || !this.tieneValor(this.talla) || this.tallaFueraDeRango()) {
      return null;
    }
    const talla = Number(this.talla);
    return Math.round((Number(this.peso) / (talla * talla)) * 10) / 10;
  }

  estadoImc(): NivelAlerta | null {
    const imc = this.imc;
    if (imc === null) return null;
    if (imc >= 30) return 'critico';              // obesidad
    if (imc < 18.5 || imc >= 25) return 'alerta'; // bajo peso / sobrepeso
    return 'normal';                              // 18.5 - 24.9
  }

  textoImc(): string {
    if (this.tallaFueraDeRango()) return 'Ingresa la talla en metros (ej. 1.70)';
    const imc = this.imc;
    if (imc === null) return 'Se calcula con peso y talla';
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  /** Cantidad de signos en estado crítico, para el resumen. */
  get totalCriticos(): number {
    return [
      this.estadoTemperatura(),
      this.estadoPresion(),
      this.estadoFrecuenciaCardiaca(),
      this.estadoFrecuenciaRespiratoria()
    ].filter(e => e === 'critico').length;
  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id || isNaN(Number(id))) {
      this.alertService.error('Identificador de cita inválido');
      this.router.navigate(['/triaje']);
      return;
    }

    this.idCita = Number(id);
    this.cargarCita();

  }

  // Cargar información del paciente
  cargarCita(): void {

    this.cargando = true;

    this.citaService.getCitaById(this.idCita).subscribe({

      next: (data) => {

        if (data.estado !== 'TRIAJE') {

          this.alertService.error(
            'Esta cita ya no está pendiente de triaje'
          );

          this.router.navigate(['/triaje']);
          return;

        }

        this.cita = data;

        this.temperatura = data.temperatura;
        this.presion = data.presion;
        this.frecuenciaCardiaca = data.frecuenciaCardiaca;
        this.frecuenciaRespiratoria = data.frecuenciaRespiratoria;

        this.peso = data.peso;
        this.talla = data.talla;

        this.cargando = false;

      },

      error: (err) => {

        console.error('Error al cargar cita:', err);

        this.alertService.error(
          'No se pudo cargar la información del paciente'
        );

        this.cargando = false;
        this.router.navigate(['/triaje']);

      }

    });

  }

  // Validar valores ingresados
  private validarValores(): boolean {

    const valores = [
      this.temperatura,
      this.presion,
      this.frecuenciaCardiaca,
      this.frecuenciaRespiratoria,
      this.peso,
      this.talla
    ];

    for (const valor of valores) {

      if (
        valor !== null &&
        (!Number.isFinite(Number(valor)) || Number(valor) <= 0)
      ) {

        this.alertService.error(
          'Los valores registrados deben ser mayores que cero'
        );

        return false;

      }

    }

    return true;

  }

  // Preparar información para actualizar
  private obtenerDatosActualizados(estado: string, observaciones: string | null): Cita {

    const cita = this.cita!;

    return {

      idCita: cita.idCita,

      fechaCita: cita.fechaCita,
      horaCita: cita.horaCita,

      notificacion: cita.notificacion,

      temperatura: this.temperatura,
      presion: this.presion,
      frecuenciaCardiaca: this.frecuenciaCardiaca,
      frecuenciaRespiratoria: this.frecuenciaRespiratoria,

      peso: this.peso,
      talla: this.talla,

      motivoConsulta: cita.motivoConsulta,

      diagnostico: cita.diagnostico,
      tratamiento: cita.tratamiento,

      observaciones: observaciones,
      indicaciones: cita.indicaciones,

      estado: estado,

      idMedico: cita.idMedico,
      idPersona: cita.idPersona,
      idEmpleado: cita.idEmpleado

    };

  }

  // Guardar evaluación
  guardarTriaje(): void {

    if (!this.cita || this.guardando) return;

    if (!this.validarValores()) return;

    this.guardando = true;

    const datos = this.obtenerDatosActualizados(
      'TRIAJE',
      this.cita.observaciones
    );

    this.citaService.updateCita(
      this.idCita,
      datos
    ).subscribe({

      next: () => {

        this.alertService.success(
          'Evaluación de triaje registrada correctamente'
        );

        this.router.navigate(['/triaje']);

      },

      error: (err) => {

        console.error('Error al guardar triaje:', err);

        this.alertService.error(
          err.error?.message ||
          'No se pudo guardar la evaluación'
        );

        this.guardando = false;

      }

    });

  }


  cancelar(): void {
    this.router.navigate(['/triaje']);
  }

}
