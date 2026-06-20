export class AutenticacionRespuesta {
  usuarioId!: string;
  accessToken!: string;
  refreshToken!: string;
}

export class RenovacionSesionRespuesta {
  accessToken!: string;
  refreshToken!: string;
}
