import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ListarHorariosSedeConsulta } from '../../../aplicacion/horarios/listar-horarios-sede.consulta';
import { HorarioRespuesta } from '../respuestas/horario.respuesta';
import {
  CONSULTADOR_SEDES,
  ConsultadorSedes,
} from '../../../dominio/sedes/consultador-sedes.puerto';

@Controller('sedes/:idSede/horarios')
export class HorariosControlador {
  constructor(
    private readonly consulta: ListarHorariosSedeConsulta,
    @Inject(CONSULTADOR_SEDES)
    private readonly sedes: ConsultadorSedes,
  ) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(@Param('idSede') idSede: string): Promise<HorarioRespuesta[]> {
    const sede = await this.sedes.obtenerPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    return this.consulta.ejecutar(idSede);
  }
}
