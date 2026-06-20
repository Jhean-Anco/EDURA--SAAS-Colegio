import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitucionEducativa } from '../../../../dominio/instituciones/institucion-educativa.entidad';
import { RepositorioInstituciones } from '../../../../dominio/instituciones/repositorio-instituciones.puerto';
import { InstitucionEducativaMapeador } from '../mapeadores/institucion-educativa.mapeador';
import { InstitucionEducativaTypeormEntidad } from '../entidades/institucion-educativa.typeorm-entidad';

@Injectable()
export class InstitucionTypeormRepositorio implements RepositorioInstituciones {
  constructor(
    @InjectRepository(InstitucionEducativaTypeormEntidad)
    private readonly repositorio: Repository<InstitucionEducativaTypeormEntidad>,
  ) {}

  async guardar(institucion: InstitucionEducativa): Promise<void> {
    await this.repositorio.save(
      this.repositorio.create({
        id: institucion.id,
        codigo: institucion.codigo,
        nombreLegal: institucion.nombreLegal,
        nombreCorto: institucion.nombreCorto,
        tipoGestion: institucion.tipoGestion,
        estado: institucion.estado,
      }),
    );
  }

  async buscarPorId(id: string): Promise<InstitucionEducativa | null> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    return entidad ? InstitucionEducativaMapeador.aDominio(entidad) : null;
  }

  async buscarPorCodigo(codigo: string): Promise<InstitucionEducativa | null> {
    const entidad = await this.repositorio.findOne({ where: { codigo } });
    return entidad ? InstitucionEducativaMapeador.aDominio(entidad) : null;
  }

  async existeCodigo(codigo: string): Promise<boolean> {
    return this.repositorio.exist({ where: { codigo } });
  }

  async listarPorAlcance(entrada: {
    ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
    institucionId: string | null;
  }): Promise<InstitucionEducativa[]> {
    const where =
      entrada.ambito === 'PLATAFORMA'
        ? {}
        : entrada.institucionId
          ? { id: entrada.institucionId }
          : {};
    const entidades = await this.repositorio.find({
      where,
      order: { nombreLegal: 'ASC' },
    });
    return entidades.map((entidad) =>
      InstitucionEducativaMapeador.aDominio(entidad),
    );
  }

  async actualizar(institucion: InstitucionEducativa): Promise<void> {
    await this.repositorio.update(institucion.id, {
      codigo: institucion.codigo,
      nombreLegal: institucion.nombreLegal,
      nombreCorto: institucion.nombreCorto,
      tipoGestion: institucion.tipoGestion,
      estado: institucion.estado,
    });
  }
}
