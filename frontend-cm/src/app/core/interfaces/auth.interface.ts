export type RolUsuario =
  | 'ADMIN'
  | 'MEDICO'
  | 'TRIAJE'
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
  idPersona: number | null;
}
