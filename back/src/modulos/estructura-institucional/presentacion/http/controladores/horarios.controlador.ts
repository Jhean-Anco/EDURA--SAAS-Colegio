import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ListarHorariosSedeConsulta } from '../../../aplicacion/horarios/listar-horarios-sede.consulta';
import { HorarioRespuesta } from '../respuestas/horario.respuesta';
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import {
  CONSULTADOR_SEDES,
  ConsultadorSedes,
} from '../../../dominio/sedes/consultador-sedes.puerto';

@Controller('sedes/:idSede/horarios')
export class HorariosControlador {
  constructor(
    private readonly consulta: ListarHorariosSedeConsulta,
    @Inject(CONSULTADOR_SEDES)
    private readonly sedes: ConsultadorSedes,
  ) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<HorarioRespuesta[]> {
    const sede = await this.sedes.obtenerActivaPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    validarSedeDelContexto(ctx, sede.institucionId, idSede);
    return this.consulta.ejecutar(idSede);
  }
}
