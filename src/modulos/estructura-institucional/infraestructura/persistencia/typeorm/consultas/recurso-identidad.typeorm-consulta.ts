import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultadorRecursosIdentidad } from '../../../../dominio/identidad/consultador-recursos-identidad.puerto';
import { RecursoIdentidadResumen } from '../../../../dominio/identidad/recursos-identidad.resumen';
import { RecursoIdentidadSedeTypeormEntidad } from '../entidades/recurso-identidad-sede.typeorm-entidad';

@Injectable()
export class RecursoIdentidadTypeormConsulta implements ConsultadorRecursosIdentidad {
  constructor(
    @InjectRepository(RecursoIdentidadSedeTypeormEntidad)
    private readonly repositorio: Repository<RecursoIdentidadSedeTypeormEntidad>,
  ) {}

  async listarPorSede(sedeId: string): Promise<RecursoIdentidadResumen[]> {
    const entidades = await this.repositorio
      .createQueryBuilder('recurso')
      .innerJoin('recurso.identidadSede', 'identidad')
      .where('identidad.id_sede = :sedeId', { sedeId })
      .orderBy('recurso.orden', 'ASC')
      .getMany();
    return entidades.map((entidad) => ({
      id: entidad.id,
      identidadSedeId: entidad.identidadSedeId,
      tipoRecurso: entidad.tipoRecurso,
      urlRecurso: entidad.urlRecurso,
      tipoMime: entidad.tipoMime,
      textoAlternativo: entidad.textoAlternativo,
      orden: entidad.orden,
      activo: entidad.activo,
    }));
  }
}
