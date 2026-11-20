
export interface Reporte {
  fecha?: string;
  inicioSemana?: string;
  finSemana?: string;
  fechaAtencion?: string;
  mes?: string;

  medico: string;
  especialidad: string;
  tipoPaciente: string;

  cantAtenciones: number;
  porcentaje: number;

  periodo?: string;
}
