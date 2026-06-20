import { Controller, Get, Param } from '@nestjs/common';
import { RecursoIdentidadRespuesta } from '../respuestas/recurso-identidad.respuesta';

@Controller('sedes/:idSede/identidad/recursos')
export class RecursosIdentidadControlador {
  constructor() {}

  @Get()
  listar(@Param('idSede') idSede: string): RecursoIdentidadRespuesta[] {
    void idSede;
    return [];
  }
}
