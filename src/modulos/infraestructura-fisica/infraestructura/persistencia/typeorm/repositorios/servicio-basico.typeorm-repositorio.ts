import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecursoNoEncontradoError } from '../../../../../../compartido/dominio/errores-dominio';
import { SedeTypeormEntidad } from '../../../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { ServicioBasicoSedeTypeormEntidad } from '../entidades/servicio-basico-sede.typeorm-entidad';
import { TipoServicioBasicoTypeormEntidad } from '../entidades/tipo-servicio-basico.typeorm-entidad';

@Injectable()
export class ServicioBasicoTypeormRepositorio {
  constructor(
    @InjectRepository(ServicioBasicoSedeTypeormEntidad)
    private readonly repositorio: Repository<ServicioBasicoSedeTypeormEntidad>,
    @InjectRepository(TipoServicioBasicoTypeormEntidad)
    private readonly tipos: Repository<TipoServicioBasicoTypeormEntidad>,
    @InjectRepository(SedeTypeormEntidad)
    private readonly sedes: Repository<SedeTypeormEntidad>,
  ) {}

  async crear(
    entidad: Partial<ServicioBasicoSedeTypeormEntidad>,
  ): Promise<ServicioBasicoSedeTypeormEntidad> {
    return this.repositorio.save(this.repositorio.create(entidad));
  }

  async listarPorSede(
    sedeId: string,
  ): Promise<ServicioBasicoSedeTypeormEntidad[]> {
    return this.repositorio.find({
      where: { sedeId },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async buscarPorId(
    id: string,
  ): Promise<ServicioBasicoSedeTypeormEntidad | null> {
    return this.repositorio.findOne({ where: { id } });
  }

  async cambiarEstado(
    id: string,
    estadoServicio: string,
  ): Promise<ServicioBasicoSedeTypeormEntidad> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    if (!entidad)
      throw new RecursoNoEncontradoError('El servicio básico no existe.');
    entidad.estadoServicio = estadoServicio;
    return this.repositorio.save(entidad);
  }

  async buscarTipoActivoPorCodigo(codigo: string) {
    return this.tipos.findOne({ where: { codigo, activo: true } });
  }

  async sedeActiva(sedeId: string): Promise<boolean> {
    return this.sedes.exist({ where: { id: sedeId, estado: 'ACTIVA' } });
  }
}
