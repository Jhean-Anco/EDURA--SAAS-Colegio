import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IdentidadVisualInstitucionTypeormEntidad,
  VersionIdentidadVisualTypeormEntidad,
  ActivoIdentidadVisualTypeormEntidad,
  PuntoAccesoInstitucionTypeormEntidad,
} from '../entidades/identidad-visual.typeorm-entidades';
import {
  RepositorioIdentidadVisual,
  RepositorioVersionesIdentidad,
  RepositorioActivosIdentidad,
  RepositorioPuntosAcceso,
} from '../../../../dominio/puertos/repositorios';

@Injectable()
export class TypeOrmRepositorioIdentidadVisual implements RepositorioIdentidadVisual {
  constructor(
    @InjectRepository(IdentidadVisualInstitucionTypeormEntidad)
    private readonly repo: Repository<IdentidadVisualInstitucionTypeormEntidad>,
  ) {}

  async buscarPorInstitucion(institucionId: string): Promise<IdentidadVisualInstitucionTypeormEntidad | null> {
    return this.repo.findOne({
      where: { idInstitucionEducativa: institucionId },
      relations: ['versionPublicada'],
    });
  }

  async guardar(identidad: IdentidadVisualInstitucionTypeormEntidad): Promise<void> {
    await this.repo.save(identidad);
  }
}

@Injectable()
export class TypeOrmRepositorioVersionesIdentidad implements RepositorioVersionesIdentidad {
  constructor(
    @InjectRepository(VersionIdentidadVisualTypeormEntidad)
    private readonly repo: Repository<VersionIdentidadVisualTypeormEntidad>,
  ) {}

  async buscarPorId(id: string): Promise<VersionIdentidadVisualTypeormEntidad | null> {
    return this.repo.findOne({ where: { id }, relations: ['activos'] });
  }

  async buscarBorrador(identidadId: string): Promise<VersionIdentidadVisualTypeormEntidad | null> {
    return this.repo.findOne({
      where: { idIdentidadVisual: identidadId, estado: 'BORRADOR' },
      relations: ['activos'],
    });
  }

  async buscarPublicada(identidadId: string): Promise<VersionIdentidadVisualTypeormEntidad | null> {
    return this.repo.findOne({
      where: { idIdentidadVisual: identidadId, estado: 'PUBLICADA' },
      relations: ['activos'],
    });
  }

  async guardar(version: VersionIdentidadVisualTypeormEntidad): Promise<void> {
    await this.repo.save(version);
  }

  async obtenerSiguienteNumeroVersion(identidadId: string): Promise<number> {
    const res = await this.repo
      .createQueryBuilder('version')
      .select('MAX(version.numero_version)', 'max')
      .where('version.id_identidad_visual = :identidadId', { identidadId })
      .getRawOne();
    return (res?.max ?? 0) + 1;
  }
}

@Injectable()
export class TypeOrmRepositorioActivosIdentidad implements RepositorioActivosIdentidad {
  constructor(
    @InjectRepository(ActivoIdentidadVisualTypeormEntidad)
    private readonly repo: Repository<ActivoIdentidadVisualTypeormEntidad>,
  ) {}

  async buscarPorId(id: string): Promise<ActivoIdentidadVisualTypeormEntidad | null> {
    return this.repo.findOne({ where: { id } });
  }

  async buscarActivoPorTipo(versionId: string, tipo: string): Promise<ActivoIdentidadVisualTypeormEntidad | null> {
    return this.repo.findOne({
      where: { idVersionIdentidadVisual: versionId, tipo, estado: 'ACTIVO' },
    });
  }

  async guardar(activo: ActivoIdentidadVisualTypeormEntidad): Promise<void> {
    await this.repo.save(activo);
  }
}

@Injectable()
export class TypeOrmRepositorioPuntosAcceso implements RepositorioPuntosAcceso {
  constructor(
    @InjectRepository(PuntoAccesoInstitucionTypeormEntidad)
    private readonly repo: Repository<PuntoAccesoInstitucionTypeormEntidad>,
  ) {}

  async buscarPorInstitucion(institucionId: string): Promise<PuntoAccesoInstitucionTypeormEntidad[]> {
    return this.repo.find({ where: { idInstitucionEducativa: institucionId } });
  }

  async buscarPorTipoYValor(tipo: string, valor: string): Promise<PuntoAccesoInstitucionTypeormEntidad | null> {
    const valorNormalizado = valor.toLowerCase().trim();
    return this.repo.findOne({ where: { tipo, valorNormalizado } });
  }

  async guardar(punto: PuntoAccesoInstitucionTypeormEntidad): Promise<void> {
    await this.repo.save(punto);
  }
}
