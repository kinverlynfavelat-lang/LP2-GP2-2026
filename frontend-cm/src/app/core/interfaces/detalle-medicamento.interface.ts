
export interface DetalleMedicamentoDTO {
  idDetalleReceta: number;
  cantidadEntregada: number;
}

export interface DetalleMedicamentoResponse {
  idDetalleMedicamento: number;
  idDetalleReceta: number;
  idMedicamento: number;
  nombreMedicamento: string;
  cantidadPrescrita: number;
  cantidadEntregada: number;
  fechaSalida: string;
  idReceta: number;
  idCita: number;
  idPersona: number;
  paciente: string;
}
