export type EstadoDerivacion =
  | 'PENDIENTE'
  | 'REALIZADA'
  | 'CANCELADA';

export interface Derivacion {
  idDerivacion: number;
  fecha: string;
  motivo: string;
  centroDestino: string;
  responsable: string;
  estado: EstadoDerivacion;
  idCita: number;
}

export interface DerivacionRequest {
  idDerivacion: number | null;
  fecha: string;
  motivo: string;
  centroDestino: string;
  responsable: string;
  estado: EstadoDerivacion;
  idCita: number;
}
