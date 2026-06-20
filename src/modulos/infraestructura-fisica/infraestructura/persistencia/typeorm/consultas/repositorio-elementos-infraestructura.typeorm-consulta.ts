import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConsultadorInfraestructura,
  ElementoInfraestructuraResumen,
} from '../../../../dominio/infraestructura/consultador-infraestructura.puerto';
import { ElementoInfraestructuraTypeormEntidad } from '../entidades/elemento-infraestructura.typeorm-entidad';

@Injectable()
export class RepositorioElementosInfraestructuraTypeormConsulta implements ConsultadorInfraestructura {
  constructor(
    @InjectRepository(ElementoInfraestructuraTypeormEntidad)
    private readonly repositorio: Repository<ElementoInfraestructuraTypeormEntidad>,
  ) {}

  listarPorSede(sedeId: string): Promise<ElementoInfraestructuraResumen[]> {
    return this.repositorio
      .find({
        where: { sedeId },
        order: { fechaCreacion: 'DESC' },
      })
      .then((entidades) =>
        entidades.map((entidad) => ({
          id: entidad.id,
          sedeId: entidad.sedeId,
          tipoElementoId: entidad.tipoElementoId,
          codigo: entidad.codigo,
          nombre: entidad.nombre,
          estado: entidad.estado,
          orden: entidad.orden,
        })),
      );
  }
}
