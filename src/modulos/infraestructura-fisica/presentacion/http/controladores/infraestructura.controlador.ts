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
import { ListarElementosInfraestructuraConsulta } from '../../../aplicacion/consultas/listar-elementos-infraestructura.consulta';
import { ElementosInfraestructuraListadoRespuesta } from '../respuestas/elementos-infraestructura-listado.respuesta';
import {
  CONSULTADOR_SEDES,
  ConsultadorSedes,
} from '../../../../estructura-institucional/dominio/sedes/consultador-sedes.puerto';

@Controller('sedes/:idSede/infraestructura')
export class InfraestructuraControlador {
  constructor(
    private readonly listarElementos: ListarElementosInfraestructuraConsulta,
    @Inject(CONSULTADOR_SEDES)
    private readonly sedes: ConsultadorSedes,
  ) {}

  @Permisos('INFRAESTRUCTURA.LEER')
  @Get('elementos')
  async listar(
    @Param('idSede') idSede: string,
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<ElementosInfraestructuraListadoRespuesta> {
    const sede = await this.sedes.obtenerPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    validarSedeDelContexto(ctx, sede.institucionId, idSede);
    const datos = await this.listarElementos.ejecutar(idSede);
    return {
      datos: datos.map((elemento) => ({
        id: elemento.id,
        sedeId: elemento.sedeId,
        tipoElementoId: elemento.tipoElementoId,
        codigo: elemento.codigo,
        nombre: elemento.nombre,
        estado: elemento.estado,
        orden: elemento.orden,
      })),
    };
  }
}
