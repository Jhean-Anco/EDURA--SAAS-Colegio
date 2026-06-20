import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GuardiaJwt } from '../../../identidad-acceso/presentacion/http/guardias/guardia-jwt';
import { GuardiaPermisos } from '../../../../compartido/presentacion/http/guardias/guardia-permisos';
import { Permisos } from '../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ConsultarDniCasoUso } from '../../aplicacion/consultar-dni.caso-uso';
import { ConsultarRucCasoUso } from '../../aplicacion/consultar-ruc.caso-uso';
import { CalcularRutaCasoUso } from '../../aplicacion/calcular-ruta.caso-uso';
import { ConsultarDniSolicitud } from './solicitudes/consultar-dni.solicitud';
import { ConsultarRucSolicitud } from './solicitudes/consultar-ruc.solicitud';
import { CalcularRutaSolicitud } from './solicitudes/calcular-ruta.solicitud';
import { ResultadoConsultaDni } from '../../dominio/puertos/consultador-dni';
import { ResultadoConsultaRuc } from '../../dominio/puertos/consultador-ruc';
import { ResultadoCalculoRuta } from '../../dominio/puertos/calculador-rutas';

@UseGuards(GuardiaJwt, GuardiaPermisos)
@Controller()
export class IntegracionesControlador {
  constructor(
    private readonly consultarDniUso: ConsultarDniCasoUso,
    private readonly consultarRucUso: ConsultarRucCasoUso,
    private readonly calcularRutaUso: CalcularRutaCasoUso,
  ) {}

  @Post('personas/consultas/dni')
  @HttpCode(HttpStatus.OK)
  @Permisos('PERSONAS.CONSULTAR_DNI')
  async consultarDni(
    @Body() solicitud: ConsultarDniSolicitud,
  ): Promise<ResultadoConsultaDni> {
    return this.consultarDniUso.ejecutar(solicitud.numeroDni);
  }

  @Post('integraciones/documentos/consultas/ruc')
  @HttpCode(HttpStatus.OK)
  @Permisos('INSTITUCIONES.CONSULTAR_RUC')
  async consultarRuc(
    @Body() solicitud: ConsultarRucSolicitud,
  ): Promise<ResultadoConsultaRuc> {
    return this.consultarRucUso.ejecutar(solicitud.ruc);
  }

  @Post('geografia/rutas/calcular')
  @HttpCode(HttpStatus.OK)
  @Permisos('GEOGRAFIA.CALCULAR_RUTA')
  async calcularRuta(
    @Body() solicitud: CalcularRutaSolicitud,
  ): Promise<ResultadoCalculoRuta> {
    return this.calcularRutaUso.ejecutar(solicitud.origen, solicitud.destino);
  }
}
