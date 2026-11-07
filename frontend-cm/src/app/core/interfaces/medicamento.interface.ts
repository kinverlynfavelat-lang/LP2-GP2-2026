
export interface Medicamento {
  idMedicamento?: number;
  nombre: string;
  descripcion: string | null;
  stock: number;
  precio: number;
  estado: string;
}
