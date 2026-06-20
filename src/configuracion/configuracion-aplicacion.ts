import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfiguracionAplicacion {
  readonly entorno: string;

  readonly puertoApi: number;

  readonly origenesCors: string[];

  readonly bdHost: string;

  readonly bdPuerto: number;

  readonly bdUsuario: string;

  readonly bdClave: string;

  readonly bdNombre: string;

  readonly bdSsl: boolean;

  readonly bdRegistroConsultas: boolean;

  readonly jwtSecreto: string;

  readonly jwtEmisor: string;

  readonly jwtAudiencia: string;

  readonly hashTokenSecreto: string;

  readonly jwtAccesoTtlSegundos: number;

  readonly tokenRefreshTtlSegundos: number;

  constructor() {
    this.entorno = process.env.ENTORNO ?? 'desarrollo';
    this.puertoApi = Number(process.env.PUERTO_API ?? 3000);
    this.origenesCors = (process.env.ORIGENES_CORS ?? 'http://localhost:5173')
      .split(',')
      .map((origen) => origen.trim())
      .filter(Boolean);
    this.bdHost = process.env.BD_HOST ?? 'localhost';
    this.bdPuerto = Number(process.env.BD_PUERTO ?? 5432);
    this.bdUsuario = process.env.BD_USUARIO ?? 'postgres';
    this.bdClave = process.env.BD_CLAVE ?? 'postgres';
    this.bdNombre = process.env.BD_NOMBRE ?? 'edura';
    this.bdSsl = (process.env.BD_SSL ?? 'false') === 'true';
    this.bdRegistroConsultas =
      (process.env.BD_REGISTRO_CONSULTAS ?? 'false') === 'true';
    this.jwtSecreto = process.env.JWT_SECRETO ?? 'dev-secret';
    this.jwtEmisor = process.env.JWT_EMISOR ?? 'EDURA';
    this.jwtAudiencia = process.env.JWT_AUDIENCIA ?? 'EDURA_WEB';
    this.hashTokenSecreto = process.env.HASH_TOKEN_SECRETO ?? 'dev-secret';
    this.jwtAccesoTtlSegundos = Number(
      process.env.JWT_ACCESO_TTL_SEGUNDOS ?? 900,
    );
    this.tokenRefreshTtlSegundos = Number(
      process.env.TOKEN_REFRESH_TTL_SEGUNDOS ?? 2592000,
    );
  }
}
