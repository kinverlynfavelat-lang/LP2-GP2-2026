
export interface Paciente {
  idPersona: number;
  dni: string;
  nombres: string;
  apellidos: string;
  tipoPaciente: string;
  codigoUniversitario: string | null;
}

export interface FondoEstudiantil {
  codigoUniversitario: string;
  saldoDisponible: number;
  fondoMaximo: number;
  costoConsulta: number;
}

export interface Medico {
  idEmpleado: number;
  especialidad: string;
  codigoCol: string;
}

export interface Horario {
  idHorario: number;
  idMedico: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

export interface Cita {
  idCita: number;
  idPersona: number;
  idMedico: number | null;
  fechaCita: string;
  horaCita: string;
  estado: string;
  medico?: string | null;
  motivoConsulta: string;
}

export interface DiaDisponible {
  fecha: string;
  dia: string;
  numero: string;
  mes: string;
  horas: string[];
}
