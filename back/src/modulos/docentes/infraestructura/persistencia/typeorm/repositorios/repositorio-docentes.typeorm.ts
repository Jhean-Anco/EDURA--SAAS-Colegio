import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import {
  AlcanceAcceso,
  DatosCreacionDocente,
  RepositorioDocentes,
} from '../../../../dominio/puertos/docentes.puerto';
import { DocenteTypeormEntidad } from '../entidades/docente.typeorm-entidad';
import { AsignacionDocenteSedeTypeormEntidad } from '../entidades/asignacion-docente-sede.typeorm-entidad';

@Injectable()
export class RepositorioDocentesTypeorm implements RepositorioDocentes {
  constructor(
    @InjectRepository(DocenteTypeormEntidad)
    private readonly docentes: Repository<DocenteTypeormEntidad>,
    @InjectRepository(AsignacionDocenteSedeTypeormEntidad)
    private readonly asignaciones: Repository<AsignacionDocenteSedeTypeormEntidad>,
    private readonly dataSource: DataSource,
  ) {}

  async verificarPersonaEnInstitucion(
    idPersona: string,
    institucionId: string,
  ): Promise<boolean> {
    const count = await this.dataSource
      .createQueryBuilder()
      .select('1')
      .from('personas', 'p')
      .where(
        'p.id = :idPersona AND p.id_institucion_educativa = :institucionId',
        { idPersona, institucionId },
      )
      .getCount();
    return count > 0;
  }

  async verificarSedeEnInstitucion(
    idSede: string,
    institucionId: string,
  ): Promise<boolean> {
    const count = await this.dataSource
      .createQueryBuilder()
      .select('1')
      .from('sedes', 's')
      .where('s.id = :idSede AND s.id_institucion_educativa = :institucionId', {
        idSede,
        institucionId,
      })
      .getCount();
    return count > 0;
  }

  async existeCodigoNormalizado(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const qb = this.docentes
      .createQueryBuilder('d')
      .where(
        'd.codigoNormalizado = :codigoNormalizado AND d.institucionId = :institucionId',
        { codigoNormalizado, institucionId },
      );
    if (excluirId) qb.andWhere('d.id != :excluirId', { excluirId });
    return (await qb.getCount()) > 0;
  }

  async personaYaEsDocente(
    idPersona: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const qb = this.docentes
      .createQueryBuilder('d')
      .where(
        'd.personaId = :idPersona AND d.institucionId = :institucionId',
        { idPersona, institucionId },
      );
    if (excluirId) qb.andWhere('d.id != :excluirId', { excluirId });
    return (await qb.getCount()) > 0;
  }

  async crearDocente(
    datos: DatosCreacionDocente & { idSede: string; fechaInicio?: string },
  ): Promise<{ id: string }> {
    return this.dataSource.transaction(async (manager) => {
      const docente = manager.create(DocenteTypeormEntidad, {
        institucionId: datos.institucionId,
        personaId: datos.idPersona,
        codigo: datos.codigo,
        codigoNormalizado: datos.codigoNormalizado,
        fechaIngreso: datos.fechaIngreso ?? null,
        perfilProfesional: datos.perfilProfesional ?? null,
        observacion: datos.observacion ?? null,
        estado: 'ACTIVO',
      });
      const guardado = await manager.save(DocenteTypeormEntidad, docente);

      // Crear asignación de sede principal automática
      await manager.save(AsignacionDocenteSedeTypeormEntidad, {
        institucionId: datos.institucionId,
        docenteId: guardado.id,
        sedeId: (datos as { idSede: string }).idSede,
        esPrincipal: true,
        fechaInicio:
          datos.fechaIngreso ?? new Date().toISOString().slice(0, 10),
        estado: 'ACTIVA',
      });

      return { id: guardado.id };
    });
  }

  async obtenerDocenteBase(
    id: string,
    alcance: AlcanceAcceso,
  ): Promise<{ id: string; estado: string; idPersona: string } | null> {
    const qb = this.docentes
      .createQueryBuilder('d')
      .where('d.id = :id AND d.institucionId = :institucionId', {
        id,
        institucionId: alcance.institucionId,
      });

    if (alcance.ambito === 'SEDE' && alcance.sedeId) {
      qb.innerJoin(
        'asignaciones_docente_sede',
        'ads',
        'ads.id_docente = d.id AND ads.id_sede = :sedeId AND ads.estado = :estadoAsig',
        { sedeId: alcance.sedeId, estadoAsig: 'ACTIVA' },
      );
    }

    const entidad = await qb.getOne();
    if (!entidad) return null;

    return {
      id: entidad.id,
      estado: entidad.estado,
      idPersona: entidad.personaId,
    };
  }

  async actualizarDocente(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    fechaIngreso?: string | null;
    fechaCese?: string | null;
    perfilProfesional?: string | null;
    observacion?: string | null;
  }): Promise<boolean> {
    const updates: Partial<DocenteTypeormEntidad> = {};
    if (entrada.codigo !== undefined) updates.codigo = entrada.codigo;
    if (entrada.codigoNormalizado !== undefined)
      updates.codigoNormalizado = entrada.codigoNormalizado;
    if (entrada.fechaIngreso !== undefined)
      updates.fechaIngreso = entrada.fechaIngreso;
    if (entrada.fechaCese !== undefined) updates.fechaCese = entrada.fechaCese;
    if (entrada.perfilProfesional !== undefined)
      updates.perfilProfesional = entrada.perfilProfesional;
    if (entrada.observacion !== undefined)
      updates.observacion = entrada.observacion;

    const result = await this.docentes.update(
      { id: entrada.id, institucionId: entrada.institucionId },
      updates,
    );
    return (result.affected ?? 0) > 0;
  }

  async cambiarEstadoDocente(
    id: string,
    institucionId: string,
    estado: string,
    fechaCese?: string | null,
  ): Promise<boolean> {
    const updates: Partial<DocenteTypeormEntidad> = { estado };
    if (fechaCese !== undefined) updates.fechaCese = fechaCese;

    const result = await this.docentes.update(
      { id, institucionId },
      updates,
    );
    return (result.affected ?? 0) > 0;
  }

  async inactivarAsignacionesDocente(
    idDocente: string,
    institucionId: string,
  ): Promise<void> {
    await this.asignaciones.update(
      { docenteId: idDocente, institucionId, estado: 'ACTIVA' },
      { estado: 'INACTIVA', esPrincipal: false },
    );
  }

  async contarSedesActivas(
    idDocente: string,
    institucionId: string,
  ): Promise<number> {
    return this.asignaciones.count({
      where: { docenteId: idDocente, institucionId, estado: 'ACTIVA' },
    });
  }

  async crearAsignacionSede(entrada: {
    institucionId: string;
    idDocente: string;
    idSede: string;
    esPrincipal: boolean;
    fechaInicio: string;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const entidad = this.asignaciones.create({
      institucionId: entrada.institucionId,
      docenteId: entrada.idDocente,
      sedeId: entrada.idSede,
      esPrincipal: entrada.esPrincipal,
      fechaInicio: entrada.fechaInicio,
      observacion: entrada.observacion ?? null,
      estado: 'ACTIVA',
    });
    const guardado = await this.asignaciones.save(entidad);
    return { id: guardado.id };
  }

  async obtenerAsignacionSedeBase(
    idAsignacion: string,
    idDocente: string,
    institucionId: string,
  ): Promise<{ id: string; esPrincipal: boolean; estado: string } | null> {
    const entidad = await this.asignaciones.findOne({
      where: { id: idAsignacion, docenteId: idDocente, institucionId },
    });
    if (!entidad) return null;
    return {
      id: entidad.id,
      esPrincipal: entidad.esPrincipal,
      estado: entidad.estado,
    };
  }

  async actualizarAsignacionSede(entrada: {
    idAsignacion: string;
    idDocente: string;
    institucionId: string;
    esPrincipal?: boolean;
    fechaFin?: string | null;
    estado?: string;
    observacion?: string | null;
  }): Promise<boolean> {
    const updates: Partial<AsignacionDocenteSedeTypeormEntidad> = {};
    if (entrada.esPrincipal !== undefined)
      updates.esPrincipal = entrada.esPrincipal;
    if (entrada.fechaFin !== undefined) updates.fechaFin = entrada.fechaFin;
    if (entrada.estado !== undefined) updates.estado = entrada.estado;
    if (entrada.observacion !== undefined)
      updates.observacion = entrada.observacion;

    const result = await this.asignaciones.update(
      {
        id: entrada.idAsignacion,
        docenteId: entrada.idDocente,
        institucionId: entrada.institucionId,
      },
      updates,
    );
    return (result.affected ?? 0) > 0;
  }

  async existeAsignacionActivaEnSede(
    idDocente: string,
    idSede: string,
    excluirId?: string,
  ): Promise<boolean> {
    const qb = this.asignaciones
      .createQueryBuilder('a')
      .where(
        'a.docenteId = :idDocente AND a.sedeId = :idSede AND a.estado = :estado',
        { idDocente, idSede, estado: 'ACTIVA' },
      );
    if (excluirId) qb.andWhere('a.id != :excluirId', { excluirId });
    return (await qb.getCount()) > 0;
  }

  async existeSedePrincipalActiva(
    idDocente: string,
    excluirId?: string,
  ): Promise<boolean> {
    const qb = this.asignaciones
      .createQueryBuilder('a')
      .where(
        'a.docenteId = :idDocente AND a.esPrincipal = true AND a.estado = :estado',
        { idDocente, estado: 'ACTIVA' },
      );
    if (excluirId) qb.andWhere('a.id != :excluirId', { excluirId });
    return (await qb.getCount()) > 0;
  }

  async quitarPrincipalAsignacionesSede(
    idDocente: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<void> {
    const qb = this.asignaciones
      .createQueryBuilder()
      .update()
      .set({ esPrincipal: false })
      .where(
        'docenteId = :idDocente AND institucionId = :institucionId AND esPrincipal = true',
        { idDocente, institucionId },
      );
    if (excluirId) qb.andWhere('id != :excluirId', { excluirId });
    await qb.execute();
  }

  async docenteTieneAsignacionEnSede(
    idDocente: string,
    idSede: string,
    institucionId: string,
  ): Promise<boolean> {
    return (
      (await this.asignaciones.count({
        where: { docenteId: idDocente, sedeId: idSede, institucionId },
      })) > 0
    );
  }
}
