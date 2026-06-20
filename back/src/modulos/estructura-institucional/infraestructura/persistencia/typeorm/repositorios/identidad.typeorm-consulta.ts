import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultadorIdentidadSede } from '../../../../dominio/identidades-sede/consultador-identidad-sede.puerto';
import { IdentidadSedeResumen } from '../../../../dominio/identidades-sede/identidad-sede.resumen';
import { IdentidadSedeTypeormEntidad } from '../entidades/identidad-sede.typeorm-entidad';

@Injectable()
export class IdentidadTypeormConsulta implements ConsultadorIdentidadSede {
  constructor(
    @InjectRepository(IdentidadSedeTypeormEntidad)
    private readonly repositorio: Repository<IdentidadSedeTypeormEntidad>,
  ) {}

  async obtenerPorSede(sedeId: string): Promise<IdentidadSedeResumen | null> {
    const entidad = await this.repositorio.findOne({ where: { sedeId } });
    return entidad
      ? {
          id: entidad.id,
          sedeId: entidad.sedeId,
          nombrePublico: entidad.nombrePublico,
          slugPublico: entidad.slugPublico,
          descripcionCorta: entidad.descripcionCorta,
          lema: entidad.lema,
          colorPrimario: entidad.colorPrimario,
          colorSecundario: entidad.colorSecundario,
          estadoPublicacion: entidad.estadoPublicacion,
          fechaPublicacion: entidad.fechaPublicacion,
          version: entidad.version,
        }
      : null;
  }
}
