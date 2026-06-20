import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sede } from '../../../../dominio/sedes/sede.entidad';
import { RepositorioSedes } from '../../../../dominio/sedes/repositorio-sedes.puerto';
import { SedeMapeador } from '../mapeadores/sede.mapeador';
import { SedeTypeormEntidad } from '../entidades/sede.typeorm-entidad';

@Injectable()
export class SedeTypeormRepositorio implements RepositorioSedes {
  constructor(
    @InjectRepository(SedeTypeormEntidad)
    private readonly repositorio: Repository<SedeTypeormEntidad>,
    private readonly dataSource: DataSource,
  ) {}

  async guardar(sede: Sede): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(SedeTypeormEntidad, {
        id: sede.id,
        institucionEducativaId: sede.institucionId,
        codigo: sede.codigo,
        nombre: sede.nombre,
        esPrincipal: sede.esPrincipal,
        estado: sede.estadoCompleto,
      });
    });
  }

  async buscarPorId(id: string): Promise<Sede | null> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    return entidad ? SedeMapeador.aDominio(entidad) : null;
  }

  async buscarPorInstitucionYId(
    institucionId: string,
    sedeId: string,
  ): Promise<Sede | null> {
    const entidad = await this.repositorio.findOne({
      where: { id: sedeId, institucionEducativaId: institucionId },
    });
    return entidad ? SedeMapeador.aDominio(entidad) : null;
  }

  async buscarPorInstitucionYCodigo(
    institucionId: string,
    codigo: string,
  ): Promise<Sede | null> {
    const entidad = await this.repositorio.findOne({
      where: { institucionEducativaId: institucionId, codigo },
    });
    return entidad ? SedeMapeador.aDominio(entidad) : null;
  }

  async listarPorInstitucion(institucionId: string): Promise<Sede[]> {
    const entidades = await this.repositorio.find({
      where: { institucionEducativaId: institucionId },
      order: { codigo: 'ASC' },
    });
    return entidades.map((entidad) => SedeMapeador.aDominio(entidad));
  }

  async obtenerPrincipal(institucionId: string): Promise<Sede | null> {
    const entidad = await this.repositorio.findOne({
      where: { institucionEducativaId: institucionId, esPrincipal: true },
    });
    return entidad ? SedeMapeador.aDominio(entidad) : null;
  }

  async establecerPrincipalAtomicamente(
    institucionId: string,
    sedeId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const sedes = await manager.find(SedeTypeormEntidad, {
        where: { institucionEducativaId: institucionId },
      });
      for (const sede of sedes) {
        sede.esPrincipal = sede.id === sedeId;
      }
      await manager.save(SedeTypeormEntidad, sedes);
    });
  }

  async cambiarEstado(sedeId: string, estado: Sede['estado']): Promise<void> {
    const entidad = await this.repositorio.findOne({ where: { id: sedeId } });
    if (!entidad) {
      return;
    }
    entidad.estado = estado;
    await this.repositorio.save(entidad);
  }
}
