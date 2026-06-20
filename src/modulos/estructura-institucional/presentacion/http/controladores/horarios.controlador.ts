import { Controller, Get, Param } from '@nestjs/common';
import { ListarHorariosSedeConsulta } from '../../../aplicacion/horarios/listar-horarios-sede.consulta';
import { HorarioRespuesta } from '../respuestas/horario.respuesta';

@Controller('sedes/:idSede/horarios')
export class HorariosControlador {
  constructor(private readonly consulta: ListarHorariosSedeConsulta) {}

  @Get()
  async listar(@Param('idSede') idSede: string): Promise<HorarioRespuesta[]> {
    return this.consulta.ejecutar(idSede);
  }
}
