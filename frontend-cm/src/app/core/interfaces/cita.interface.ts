export interface Cita {
  idCita?: number;
  fechaCita: string;
  horaCita: string;
  notificacion: string | null;
  temperatura: number | null;
  presion: number | null;
  frecuenciaCardiaca: number | null;
  frecuenciaRespiratoria: number | null;
  peso: number | null;
  talla: number | null;
  motivoConsulta: string;
  diagnostico: string | null;
  tratamiento: string | null;
  observaciones: string | null;
  indicaciones: string | null;
  estado: string | null;

  idMedico: number | null;
  idPersona: number;
  idEmpleado: number | null;

  paciente?: string;
  medico?: string;
  empleadoTriaje?: string;
}