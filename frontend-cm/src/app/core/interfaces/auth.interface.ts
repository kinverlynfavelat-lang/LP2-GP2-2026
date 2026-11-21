export type RolUsuario =
  | 'ADMIN'
  | 'MEDICO'
  | 'TRIAJE'
  | 'RECEPCION'
  | 'FARMACIA';

export interface ILoginRequest {
  usuario: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  usuario: string;
  rol: RolUsuario;
  idUsuario: number;
}
