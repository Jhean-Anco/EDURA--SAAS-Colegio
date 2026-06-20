import { Controller, Get } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ListarUbigeosConsulta } from '../../../aplicacion/ubigeos/listar-ubigeos.consulta';
import { UbigeoRespuesta } from '../respuestas/ubigeo.respuesta';

@Controller('ubigeos')
export class UbigeosControlador {
  constructor(private readonly listarUbigeos: ListarUbigeosConsulta) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(): Promise<{ datos: UbigeoRespuesta[] }> {
    const ubigeos = await this.listarUbigeos.ejecutar();
    return { datos: ubigeos };
  }
}
