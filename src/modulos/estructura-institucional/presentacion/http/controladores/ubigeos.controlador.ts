import { Controller, Get } from '@nestjs/common';
import { ListarUbigeosConsulta } from '../../../aplicacion/ubigeos/listar-ubigeos.consulta';
import { UbigeoRespuesta } from '../respuestas/ubigeo.respuesta';

@Controller('ubigeos')
export class UbigeosControlador {
  constructor(private readonly listarUbigeos: ListarUbigeosConsulta) {}

  @Get()
  async listar(): Promise<{ datos: UbigeoRespuesta[] }> {
    const ubigeos = await this.listarUbigeos.ejecutar();
    return { datos: ubigeos };
  }
}
