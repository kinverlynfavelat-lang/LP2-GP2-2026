export type EstadoCivil =
  | 'SOLTERO'
  | 'CASADO'
  | 'VIUDO'
  | 'DIVORCIADO'
  | 'CONVIVIENTE';

export type EstadoPersona =
  | 'ACTIVO'
  | 'INACTIVO'
  | 'SUSPENDIDO'
  | 'CESADO';

export type TipoPersona =
  | 'PACIENTE'
  | 'EMPLEADO';

export type TipoPaciente =
  | 'ESTUDIANTE'
  | 'DOCENTE'
  | 'ADMINISTRATIVO'
  | 'EXTERNO';

export type SiNo = 'SI' | 'NO' | 'S' | 'N';

export interface Persona {
  idPersona?: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string | null;
  fechaNacimiento: string;
  estadoCivil: EstadoCivil;
  alergias: string | null;
  tipoPersona: TipoPersona;
  tipoPaciente: TipoPaciente | null;
  codigoUniversitario: string | null;
  saldoFondo: number | null;
  matriculaVigente: SiNo | null;
  estado: EstadoPersona;
  idUsuario: number | null;
}