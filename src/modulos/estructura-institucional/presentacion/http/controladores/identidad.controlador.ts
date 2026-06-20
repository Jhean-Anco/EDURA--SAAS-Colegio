import { Controller, Get, Param } from '@nestjs/common';
import { IdentidadTypeormConsulta } from '../../../infraestructura/persistencia/typeorm/repositorios/identidad.typeorm-consulta';
import { IdentidadSedeTypeormEntidad } from '../../../infraestructura/persistencia/typeorm/entidades/identidad-sede.typeorm-entidad';

@Controller('sedes/:idSede/identidad')
export class IdentidadControlador {
  constructor(private readonly consulta: IdentidadTypeormConsulta) {}

  @Get()
  async obtener(
    @Param('idSede') idSede: string,
  ): Promise<IdentidadSedeTypeormEntidad | null> {
    return this.consulta.obtenerPorSede(idSede);
  }
}
