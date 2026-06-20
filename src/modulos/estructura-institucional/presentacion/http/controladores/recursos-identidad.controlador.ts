import { Controller, Get, Param } from '@nestjs/common';
import { ListarRecursosIdentidadConsulta } from '../../../aplicacion/identidad/listar-recursos-identidad.consulta';
import { RecursoIdentidadRespuesta } from '../respuestas/recurso-identidad.respuesta';

@Controller('sedes/:idSede/identidad/recursos')
export class RecursosIdentidadControlador {
  constructor(
    private readonly listarRecursosIdentidad: ListarRecursosIdentidadConsulta,
  ) {}

  @Get()
  async listar(
    @Param('idSede') idSede: string,
  ): Promise<RecursoIdentidadRespuesta[]> {
    return this.listarRecursosIdentidad.ejecutar(idSede);
  }
}
