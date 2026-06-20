import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UbigeoTypeormEntidad } from '../../infraestructura/persistencia/typeorm/entidades/ubigeo.typeorm-entidad';

@Injectable()
export class ListarUbigeosConsulta {
  constructor(
    @InjectRepository(UbigeoTypeormEntidad)
    private readonly repositorio: Repository<UbigeoTypeormEntidad>,
  ) {}

  async ejecutar() {
    return this.repositorio.find({ order: { codigo: 'ASC' } });
  }
}
