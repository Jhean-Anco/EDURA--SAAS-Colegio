import { Controller, Get } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ContextoActual } from '../../../../../compartido/presentacion/http/decoradores/contexto-actual.decorador';
import { ContextoSolicitudAutenticada } from '../../../../../compartido/aplicacion/contexto-solicitud-autenticada';
import { ListarUbigeosConsulta } from '../../../aplicacion/ubigeos/listar-ubigeos.consulta';
import { UbigeoRespuesta } from '../respuestas/ubigeo.respuesta';

@Controller('ubigeos')
export class UbigeosControlador {
  constructor(private readonly listarUbigeos: ListarUbigeosConsulta) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @ContextoActual() ctx: ContextoSolicitudAutenticada | undefined,
  ): Promise<{ datos: UbigeoRespuesta[] }> {
    void ctx;
    const ubigeos = await this.listarUbigeos.ejecutar();
    return { datos: ubigeos };
  }
}
