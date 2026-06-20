import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ListarRecursosIdentidadConsulta } from '../../../aplicacion/identidad/listar-recursos-identidad.consulta';
import { RecursoIdentidadRespuesta } from '../respuestas/recurso-identidad.respuesta';
import {
  CONSULTADOR_SEDES,
  ConsultadorSedes,
} from '../../../dominio/sedes/consultador-sedes.puerto';

@Controller('sedes/:idSede/identidad/recursos')
export class RecursosIdentidadControlador {
  constructor(
    private readonly listarRecursosIdentidad: ListarRecursosIdentidadConsulta,
    @Inject(CONSULTADOR_SEDES)
    private readonly sedes: ConsultadorSedes,
  ) {}

  @Permisos('SEDES.LEER')
  @Get()
  async listar(
    @Param('idSede') idSede: string,
  ): Promise<RecursoIdentidadRespuesta[]> {
    const sede = await this.sedes.obtenerPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    return this.listarRecursosIdentidad.ejecutar(idSede);
  }
}
