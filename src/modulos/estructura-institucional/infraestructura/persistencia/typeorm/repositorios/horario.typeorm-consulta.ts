import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultadorHorariosSede } from '../../../../dominio/horarios-sede/consultador-horarios.puerto';
import { HorarioSedeResumen } from '../../../../dominio/horarios-sede/horario-sede.resumen';
import { HorarioAtencionSedeTypeormEntidad } from '../entidades/horario-atencion-sede.typeorm-entidad';

@Injectable()
export class HorarioTypeormConsulta implements ConsultadorHorariosSede {
  constructor(
    @InjectRepository(HorarioAtencionSedeTypeormEntidad)
    private readonly repositorio: Repository<HorarioAtencionSedeTypeormEntidad>,
  ) {}

  async listarPorSede(sedeId: string): Promise<HorarioSedeResumen[]> {
    const entidades = await this.repositorio.find({
      where: { sedeId },
      order: { diaSemana: 'ASC', ordenIntervalo: 'ASC' },
    });
    return entidades.map((entidad) => ({
      id: entidad.id,
      sedeId: entidad.sedeId,
      diaSemana: entidad.diaSemana,
      horaInicio: entidad.horaInicio,
      horaFin: entidad.horaFin,
      cerrado: entidad.cerrado,
      ordenIntervalo: entidad.ordenIntervalo,
      observaciones: entidad.observaciones,
      estado: entidad.estado,
    }));
  }
}
