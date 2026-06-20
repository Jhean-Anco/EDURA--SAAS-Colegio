import { Controller, Get, Param } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import { ListarRecursosIdentidadConsulta } from '../../../aplicacion/identidad/listar-recursos-identidad.consulta';
import { RecursoIdentidadRespuesta } from '../respuestas/recurso-identidad.respuesta';

@Controller('sedes/:idSede/identidad/recursos')
export class RecursosIdentidadControlador {
  constructor(
    private readonly listarRecursosIdentidad: ListarRecursosIdentidadConsulta,
  ) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<RecursoIdentidadRespuesta[]> {
    validarSedeDelContexto(ctx, ctx?.institucionId ?? '', idSede);
    return this.listarRecursosIdentidad.ejecutar(idSede);
  }
}
