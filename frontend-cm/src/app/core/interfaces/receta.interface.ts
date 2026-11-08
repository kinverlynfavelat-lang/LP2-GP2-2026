
export interface DetalleReceta {
  idDetalleReceta: number;
  idMedicamento: number;
  medicamento: string;
  dosis: string;
  indicaciones: string;
  cantidad: number;
}

export interface Receta {
  idReceta: number;
  idCita: number;
  fechaEmision: string;
  paciente: string;
  edad: number | null;
  diagnostico: string;
  tratamiento: string;
  detalles: DetalleReceta[];
}
