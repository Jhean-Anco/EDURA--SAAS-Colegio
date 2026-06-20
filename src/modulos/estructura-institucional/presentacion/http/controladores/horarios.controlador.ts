import { Controller, Get, Param } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ListarHorariosSedeConsulta } from '../../../aplicacion/horarios/listar-horarios-sede.consulta';
import { HorarioRespuesta } from '../respuestas/horario.respuesta';

@Controller('sedes/:idSede/horarios')
export class HorariosControlador {
  constructor(private readonly consulta: ListarHorariosSedeConsulta) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(@Param('idSede') idSede: string): Promise<HorarioRespuesta[]> {
    return this.consulta.ejecutar(idSede);
  }
}
