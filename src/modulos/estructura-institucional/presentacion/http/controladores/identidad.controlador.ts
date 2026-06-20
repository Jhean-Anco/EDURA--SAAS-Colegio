import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ObtenerIdentidadSedeConsulta } from '../../../aplicacion/identidad/obtener-identidad-sede.consulta';
import { IdentidadRespuesta } from '../respuestas/identidad.respuesta';
import {
  CONSULTADOR_SEDES,
  ConsultadorSedes,
} from '../../../dominio/sedes/consultador-sedes.puerto';

@Controller('sedes/:idSede/identidad')
export class IdentidadControlador {
  constructor(
    private readonly consulta: ObtenerIdentidadSedeConsulta,
    @Inject(CONSULTADOR_SEDES)
    private readonly sedes: ConsultadorSedes,
  ) {}

  @Permisos('SEDES.LEER')
  @Get()
  async obtener(
    @Param('idSede') idSede: string,
  ): Promise<IdentidadRespuesta | null> {
    const sede = await this.sedes.obtenerPorId(idSede);
    if (!sede) {
      throw new NotFoundException('RECURSO_NO_ENCONTRADO');
    }
    return this.consulta.ejecutar(idSede);
  }
}
