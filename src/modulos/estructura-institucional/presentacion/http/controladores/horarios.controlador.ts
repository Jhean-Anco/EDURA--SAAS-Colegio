import { Controller, Get, Param } from '@nestjs/common';
import { HorarioTypeormConsulta } from '../../../infraestructura/persistencia/typeorm/repositorios/horario.typeorm-consulta';
import { HorarioRespuesta } from '../respuestas/horario.respuesta';

@Controller('sedes/:idSede/horarios')
export class HorariosControlador {
  constructor(private readonly consulta: HorarioTypeormConsulta) {}

  @Get()
  async listar(@Param('idSede') idSede: string): Promise<HorarioRespuesta[]> {
    return this.consulta.listarPorSede(idSede);
  }
}
