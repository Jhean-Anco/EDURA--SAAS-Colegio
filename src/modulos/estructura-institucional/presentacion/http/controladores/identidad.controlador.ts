import { Controller, Get, Param } from '@nestjs/common';
import { IdentidadTypeormConsulta } from '../../../infraestructura/persistencia/typeorm/repositorios/identidad.typeorm-consulta';
import { IdentidadRespuesta } from '../respuestas/identidad.respuesta';

@Controller('sedes/:idSede/identidad')
export class IdentidadControlador {
  constructor(private readonly consulta: IdentidadTypeormConsulta) {}

  @Get()
  async obtener(
    @Param('idSede') idSede: string,
  ): Promise<IdentidadRespuesta | null> {
    return this.consulta.obtenerPorSede(idSede);
  }
}
