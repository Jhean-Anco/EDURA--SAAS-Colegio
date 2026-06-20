import { Controller, Get, Param } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import { ObtenerIdentidadSedeConsulta } from '../../../aplicacion/identidad/obtener-identidad-sede.consulta';
import { IdentidadRespuesta } from '../respuestas/identidad.respuesta';

@Controller('sedes/:idSede/identidad')
export class IdentidadControlador {
  constructor(private readonly consulta: ObtenerIdentidadSedeConsulta) {}

  @Permisos('SEDES.LEER')
  @Get()
  async obtener(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<IdentidadRespuesta | null> {
    validarSedeDelContexto(ctx, ctx?.institucionId ?? '', idSede);
    return this.consulta.ejecutar(idSede);
  }
}
