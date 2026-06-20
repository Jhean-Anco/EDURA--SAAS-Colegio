import { Controller, Get, Param } from '@nestjs/common';
import { HorarioTypeormConsulta } from '../../../infraestructura/persistencia/typeorm/repositorios/horario.typeorm-consulta';

@Controller('sedes/:idSede/horarios')
export class HorariosControlador {
  constructor(private readonly consulta: HorarioTypeormConsulta) {}

  @Get()
  async listar(@Param('idSede') idSede: string): Promise<unknown[]> {
    return this.consulta.listarPorSede(idSede);
  }
}
