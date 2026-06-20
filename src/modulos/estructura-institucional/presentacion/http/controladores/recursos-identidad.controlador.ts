import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecursoIdentidadSedeTypeormEntidad } from '../../../infraestructura/persistencia/typeorm/entidades/recurso-identidad-sede.typeorm-entidad';

@Controller('sedes/:idSede/identidad/recursos')
export class RecursosIdentidadControlador {
  constructor(
    @InjectRepository(RecursoIdentidadSedeTypeormEntidad)
    private readonly repositorio: Repository<RecursoIdentidadSedeTypeormEntidad>,
  ) {}

  @Get()
  async listar(@Param('idSede') idSede: string): Promise<unknown[]> {
    return this.repositorio
      .createQueryBuilder('recurso')
      .innerJoin('recurso.identidadSede', 'identidad')
      .where('identidad.id_sede = :idSede', { idSede })
      .orderBy('recurso.orden', 'ASC')
      .getMany();
  }
}
