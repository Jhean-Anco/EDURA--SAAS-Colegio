import { Controller, Get, Param } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import { ListarHorariosSedeConsulta } from '../../../aplicacion/horarios/listar-horarios-sede.consulta';
import { HorarioRespuesta } from '../respuestas/horario.respuesta';

@Controller('sedes/:idSede/horarios')
export class HorariosControlador {
  constructor(private readonly consulta: ListarHorariosSedeConsulta) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<HorarioRespuesta[]> {
    validarSedeDelContexto(ctx, ctx?.institucionId ?? '', idSede);
    return this.consulta.ejecutar(idSede);
  }
}
