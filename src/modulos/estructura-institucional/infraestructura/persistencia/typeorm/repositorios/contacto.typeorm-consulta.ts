import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CanalContactoSedeTypeormEntidad } from '../entidades/canal-contacto-sede.typeorm-entidad';

@Injectable()
export class ContactoTypeormConsulta {
  constructor(
    @InjectRepository(CanalContactoSedeTypeormEntidad)
    private readonly repositorio: Repository<CanalContactoSedeTypeormEntidad>,
  ) {}

  async listarPorSede(
    sedeId: string,
  ): Promise<CanalContactoSedeTypeormEntidad[]> {
    return this.repositorio.find({
      where: { sedeId },
      order: { orden: 'ASC' },
    });
  }
}
