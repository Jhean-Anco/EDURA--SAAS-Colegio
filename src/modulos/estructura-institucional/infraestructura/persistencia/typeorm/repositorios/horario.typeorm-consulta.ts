import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorarioAtencionSedeTypeormEntidad } from '../entidades/horario-atencion-sede.typeorm-entidad';

@Injectable()
export class HorarioTypeormConsulta {
  constructor(
    @InjectRepository(HorarioAtencionSedeTypeormEntidad)
    private readonly repositorio: Repository<HorarioAtencionSedeTypeormEntidad>,
  ) {}

  async listarPorSede(
    sedeId: string,
  ): Promise<HorarioAtencionSedeTypeormEntidad[]> {
    return this.repositorio.find({
      where: { sedeId },
      order: { diaSemana: 'ASC', ordenIntervalo: 'ASC' },
    });
  }
}
