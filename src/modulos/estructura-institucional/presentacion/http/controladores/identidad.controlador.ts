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
import { validarSedeDelContexto } from '../../../../../compartido/presentacion/http/validacion-contexto-http';
import { ObtenerIdentidadSedeConsulta } from '../../../aplicacion/identidad/obtener-identidad-sede.consulta';
import { IdentidadRespuesta } from '../respuestas/identidad.respuesta';
import {
  CONSULTADOR_SEDES,
  ConsultadorSedes,
} from '../../../dominio/sedes/consultador-sedes.puerto';

@Controller('sedes/:idSede/identidad')
export class IdentidadControlador {
  constructor(
    private readonly consulta: ObtenerIdentidadSedeConsulta,
    @Inject(CONSULTADOR_SEDES)
    private readonly sedes: ConsultadorSedes,
  ) {}

  @Permisos('SEDES.LEER')
  @Get()
  async obtener(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<IdentidadRespuesta | null> {
    const sede = await this.sedes.obtenerActivaPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    validarSedeDelContexto(ctx, sede.institucionId, idSede);
    return this.consulta.ejecutar(idSede);
  }
}
