export interface Pago {
  idCita?: number;
  fecha: string | null;
  motivoPago: string | null;
  monto: number | null;
  medioPago: string | null;
}