import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConsultadorSedes,
  DatosMinimosSede,
} from '../../../../dominio/sedes/consultador-sedes.puerto';
import { SedeTypeormEntidad } from '../entidades/sede.typeorm-entidad';

@Injectable()
export class ConsultadorSedesTypeormConsulta implements ConsultadorSedes {
  constructor(
    @InjectRepository(SedeTypeormEntidad)
    private readonly repositorio: Repository<SedeTypeormEntidad>,
  ) {}

  private aDatoMinimo(entidad: SedeTypeormEntidad): DatosMinimosSede {
    return {
      id: entidad.id,
      institucionId: entidad.institucionEducativaId,
      codigo: entidad.codigo,
      nombre: entidad.nombre,
      estado: entidad.estado,
      esPrincipal: entidad.esPrincipal,
    };
  }

  async obtenerPorId(id: string): Promise<DatosMinimosSede | null> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    return entidad ? this.aDatoMinimo(entidad) : null;
  }

  async obtenerActivaPorId(id: string): Promise<DatosMinimosSede | null> {
    const entidad = await this.repositorio.findOne({
      where: { id, estado: 'ACTIVA' },
    });
    return entidad ? this.aDatoMinimo(entidad) : null;
  }

  async perteneceAInstitucion(
    idSede: string,
    idInstitucion: string,
  ): Promise<boolean> {
    return this.repositorio.exist({
      where: { id: idSede, institucionEducativaId: idInstitucion },
    });
  }

  async verificarActiva(idSede: string): Promise<boolean> {
    return this.repositorio.exist({ where: { id: idSede, estado: 'ACTIVA' } });
  }
}
