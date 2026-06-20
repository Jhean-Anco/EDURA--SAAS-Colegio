import { Injectable } from '@nestjs/common';

function leerEntero(valor: string | undefined, defecto: number): number {
  const numero = Number(valor ?? defecto);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new Error(`Variable de entorno invalida: ${valor ?? defecto}`);
  }
  return numero;
}

function leerBooleano(valor: string | undefined, defecto: boolean): boolean {
  if (valor === undefined) {
    return defecto;
  }
  return valor === 'true';
}

function leerLista(valor: string | undefined, defecto: string): string[] {
  return (valor ?? defecto)
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
}

@Injectable()
export class ConfiguracionAplicacion {
  readonly entorno = process.env.ENTORNO ?? 'desarrollo';

  readonly puertoApi = leerEntero(process.env.PUERTO_API, 3000);

  readonly origenesCors = leerLista(
    process.env.ORIGENES_CORS,
    'http://localhost:5173',
  );

  readonly swaggerHabilitado = leerBooleano(
    process.env.SWAGGER_HABILITADO,
    this.entorno === 'desarrollo' || this.entorno === 'pruebas',
  );

  readonly bdHost = process.env.BD_HOST ?? 'localhost';

  readonly bdPuerto = leerEntero(process.env.BD_PUERTO, 5432);

  readonly bdUsuario = process.env.BD_USUARIO ?? 'postgres';

  readonly bdClave = process.env.BD_CLAVE ?? 'postgres';

  readonly bdNombre = process.env.BD_NOMBRE ?? 'edura';

  readonly bdSsl = leerBooleano(process.env.BD_SSL, false);

  readonly bdRegistroConsultas = leerBooleano(
    process.env.BD_REGISTRO_CONSULTAS,
    false,
  );

  readonly jwtSecreto = process.env.JWT_SECRETO ?? 'dev-secret';

  readonly jwtEmisor = process.env.JWT_EMISOR ?? 'EDURA';

  readonly jwtAudiencia = process.env.JWT_AUDIENCIA ?? 'EDURA_WEB';

  readonly hashTokenSecreto = process.env.HASH_TOKEN_SECRETO ?? 'dev-secret';

  readonly jwtAccesoTtlSegundos = leerEntero(
    process.env.JWT_ACCESO_TTL_SEGUNDOS,
    900,
  );

  readonly tokenRefreshTtlSegundos = leerEntero(
    process.env.TOKEN_REFRESH_TTL_SEGUNDOS,
    2592000,
  );

  readonly integracionDocumentosHabilitada = leerBooleano(
    process.env.INTEGRACION_DOCUMENTOS_HABILITADA,
    false,
  );

  readonly apisperuToken = process.env.APISPERU_TOKEN ?? '';

  readonly apisperuUrlBase =
    process.env.APISPERU_URL_BASE ?? 'https://dniruc.apisperu.com/api/v1';

  readonly apisperuTimeoutMs = leerEntero(
    process.env.APISPERU_TIMEOUT_MS,
    3000,
  );

  readonly googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? '';

  readonly googleMapsTimeoutMs = leerEntero(
    process.env.GOOGLE_MAPS_TIMEOUT_MS,
    4000,
  );

  readonly integracionRutasHabilitada = leerBooleano(
    process.env.INTEGRACION_RUTAS_HABILITADA,
    false,
  );
}
