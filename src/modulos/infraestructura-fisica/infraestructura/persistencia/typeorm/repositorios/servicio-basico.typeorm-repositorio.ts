import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecursoNoEncontradoError } from '../../../../../../compartido/dominio/errores-dominio';
import { SedeTypeormEntidad } from '../../../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { RepositorioServiciosBasicos } from '../../../../aplicacion/servicios-basicos/puertos';
import { ServicioBasicoSedeRespuesta } from '../../../../dominio/servicios-basicos/servicio-basico.respuesta';
import { ServicioBasicoSedeTypeormEntidad } from '../entidades/servicio-basico-sede.typeorm-entidad';
import { TipoServicioBasicoTypeormEntidad } from '../entidades/tipo-servicio-basico.typeorm-entidad';

@Injectable()
export class ServicioBasicoTypeormRepositorio implements RepositorioServiciosBasicos {
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
  ): Promise<ServicioBasicoSedeRespuesta> {
    return this.mapear(
      await this.repositorio.save(this.repositorio.create(entidad)),
    );
  }

  async listarPorSede(sedeId: string): Promise<ServicioBasicoSedeRespuesta[]> {
    const entidades = await this.repositorio.find({
      where: { sedeId },
      order: { fechaCreacion: 'DESC' },
    });
    return entidades.map((entidad) => this.mapear(entidad));
  }

  async buscarPorId(id: string): Promise<ServicioBasicoSedeRespuesta | null> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    return entidad ? this.mapear(entidad) : null;
  }

  async cambiarEstado(
    id: string,
    estadoServicio: string,
  ): Promise<ServicioBasicoSedeRespuesta> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    if (!entidad)
      throw new RecursoNoEncontradoError('El servicio basico no existe.');
    entidad.estadoServicio = estadoServicio;
    return this.mapear(await this.repositorio.save(entidad));
  }

  async buscarTipoActivoPorCodigo(codigo: string) {
    return this.tipos.findOne({ where: { codigo, activo: true } });
  }

  async sedeActiva(sedeId: string): Promise<boolean> {
    return this.sedes.exist({ where: { id: sedeId, estado: 'ACTIVA' } });
  }

  private mapear(
    entidad: ServicioBasicoSedeTypeormEntidad,
  ): ServicioBasicoSedeRespuesta {
    return {
      id: entidad.id,
      sedeId: entidad.sedeId,
      tipoServicioBasicoId: entidad.tipoServicioBasicoId,
      proveedor: entidad.proveedor,
      numeroSuministro: entidad.numeroSuministro,
      estadoServicio: entidad.estadoServicio,
      fechaInicio: entidad.fechaInicio,
      fechaFin: entidad.fechaFin,
    };
  }
}
