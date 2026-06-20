import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DireccionSede } from '../../../../dominio/direcciones-sede/direccion-sede.entidad';
import { DireccionSedeTypeormEntidad } from '../entidades/direccion-sede.typeorm-entidad';

@Injectable()
export class DireccionTypeormRepositorio {
  constructor(
    @InjectRepository(DireccionSedeTypeormEntidad)
    private readonly repositorio: Repository<DireccionSedeTypeormEntidad>,
  ) {}

  async buscarPorSede(sedeId: string): Promise<DireccionSede | null> {
    const entidad = await this.repositorio.findOne({ where: { sedeId } });
    return entidad
      ? DireccionSede.reconstruir({
          id: entidad.id,
          sedeId: entidad.sedeId,
          idUbigeo: entidad.idUbigeo,
          direccionLinea: entidad.direccionLinea,
          referencia: entidad.referencia,
          latitud: entidad.latitud,
          longitud: entidad.longitud,
          codigoPostal: entidad.codigoPostal,
        })
      : null;
  }

  async guardar(direccion: DireccionSede): Promise<void> {
    await this.repositorio.save({
      id: direccion.id,
      sedeId: direccion.sedeId,
      direccionLinea: direccion.direccionLinea,
    });
  }
}
