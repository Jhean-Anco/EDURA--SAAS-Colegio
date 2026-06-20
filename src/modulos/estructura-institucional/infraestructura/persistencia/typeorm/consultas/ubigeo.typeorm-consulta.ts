import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultadorUbigeos } from '../../../../dominio/ubigeos/consultador-ubigeos.puerto';
import { UbigeoResumen } from '../../../../dominio/ubigeos/ubigeo.resumen';
import { UbigeoTypeormEntidad } from '../entidades/ubigeo.typeorm-entidad';

@Injectable()
export class UbigeoTypeormConsulta implements ConsultadorUbigeos {
  constructor(
    @InjectRepository(UbigeoTypeormEntidad)
    private readonly repositorio: Repository<UbigeoTypeormEntidad>,
  ) {}

  async listar(): Promise<UbigeoResumen[]> {
    const entidades = await this.repositorio.find({ order: { codigo: 'ASC' } });
    return entidades.map((entidad) => ({
      id: entidad.id,
      codigo: entidad.codigo,
      nombre: entidad.nombre,
      nivel: entidad.nivel,
      estado: entidad.estado as 'ACTIVO' | 'INACTIVO',
      idUbigeoPadre: entidad.idUbigeoPadre,
    }));
  }
}
