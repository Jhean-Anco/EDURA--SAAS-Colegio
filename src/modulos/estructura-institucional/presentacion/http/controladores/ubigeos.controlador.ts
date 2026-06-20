import { Controller, Get } from '@nestjs/common';
import { ListarUbigeosConsulta } from '../../../aplicacion/ubigeos/listar-ubigeos.consulta';

@Controller('ubigeos')
export class UbigeosControlador {
  constructor(private readonly listarUbigeos: ListarUbigeosConsulta) {}

  @Get()
  async listar(): Promise<{ datos: unknown[] }> {
    const ubigeos = await this.listarUbigeos.ejecutar();
    return { datos: ubigeos };
  }
}
