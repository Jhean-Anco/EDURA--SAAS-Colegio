export class AutenticacionRespuesta {
  usuarioId!: string;
  nombreMostrado!: string;
  correo!: string;
  requiereCambioClave!: boolean;
  accessToken!: string;
  refreshToken!: string;
}

export class RenovacionSesionRespuesta {
  accessToken!: string;
  refreshToken!: string;
}
