import { Controller, Get, Param } from '@nestjs/common';
import { Permisos } from '../../../../../compartido/presentacion/http/decoradores/permisos.decorador';
import { ObtenerIdentidadSedeConsulta } from '../../../aplicacion/identidad/obtener-identidad-sede.consulta';
import { IdentidadRespuesta } from '../respuestas/identidad.respuesta';

@Controller('sedes/:idSede/identidad')
export class IdentidadControlador {
  constructor(private readonly consulta: ObtenerIdentidadSedeConsulta) {}

  @Permisos('SEDES.LEER')
  @Get()
  async obtener(
    @Param('idSede') idSede: string,
  ): Promise<IdentidadRespuesta | null> {
    return this.consulta.ejecutar(idSede);
  }
}
