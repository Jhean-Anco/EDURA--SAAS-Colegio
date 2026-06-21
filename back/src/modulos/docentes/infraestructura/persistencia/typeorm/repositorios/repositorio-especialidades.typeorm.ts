import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositorioEspecialidadesProfesionales } from '../../../../dominio/puertos/docentes.puerto';
import { EspecialidadProfesionalTypeormEntidad } from '../entidades/especialidad-profesional.typeorm-entidad';
import { DocenteEspecialidadTypeormEntidad } from '../entidades/docente-especialidad.typeorm-entidad';

@Injectable()
export class RepositorioEspecialidadesTypeorm
  implements RepositorioEspecialidadesProfesionales
{
  constructor(
    @InjectRepository(EspecialidadProfesionalTypeormEntidad)
    private readonly especialidades: Repository<EspecialidadProfesionalTypeormEntidad>,
    @InjectRepository(DocenteEspecialidadTypeormEntidad)
    private readonly asignaciones: Repository<DocenteEspecialidadTypeormEntidad>,
  ) {}

  async existeCodigoNormalizadoEsp(
    codigoNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const qb = this.especialidades
      .createQueryBuilder('e')
      .where(
        'e.codigoNormalizado = :codigoNormalizado AND e.institucionId = :institucionId',
        { codigoNormalizado, institucionId },
      );
    if (excluirId) qb.andWhere('e.id != :excluirId', { excluirId });
    return (await qb.getCount()) > 0;
  }

  async existeNombreNormalizadoEsp(
    nombreNormalizado: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const qb = this.especialidades
      .createQueryBuilder('e')
      .where(
        'e.nombreNormalizado = :nombreNormalizado AND e.institucionId = :institucionId',
        { nombreNormalizado, institucionId },
      );
    if (excluirId) qb.andWhere('e.id != :excluirId', { excluirId });
    return (await qb.getCount()) > 0;
  }

  async crearEspecialidad(entrada: {
    institucionId: string;
    codigo: string;
    codigoNormalizado: string;
    nombre: string;
    nombreNormalizado: string;
    descripcion?: string | null;
  }): Promise<{ id: string }> {
    const entidad = this.especialidades.create({
      institucionId: entrada.institucionId,
      codigo: entrada.codigo,
      codigoNormalizado: entrada.codigoNormalizado,
      nombre: entrada.nombre,
      nombreNormalizado: entrada.nombreNormalizado,
      descripcion: entrada.descripcion ?? null,
      estado: 'ACTIVA',
    });
    const guardado = await this.especialidades.save(entidad);
    return { id: guardado.id };
  }

  async obtenerEspecialidadBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; estado: string } | null> {
    const entidad = await this.especialidades.findOne({
      where: { id, institucionId },
    });
    if (!entidad) return null;
    return { id: entidad.id, estado: entidad.estado };
  }

  async actualizarEspecialidad(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    codigoNormalizado?: string;
    nombre?: string;
    nombreNormalizado?: string;
    descripcion?: string | null;
    estado?: string;
  }): Promise<boolean> {
    const updates: Partial<EspecialidadProfesionalTypeormEntidad> = {};
    if (entrada.codigo !== undefined) updates.codigo = entrada.codigo;
    if (entrada.codigoNormalizado !== undefined)
      updates.codigoNormalizado = entrada.codigoNormalizado;
    if (entrada.nombre !== undefined) updates.nombre = entrada.nombre;
    if (entrada.nombreNormalizado !== undefined)
      updates.nombreNormalizado = entrada.nombreNormalizado;
    if (entrada.descripcion !== undefined)
      updates.descripcion = entrada.descripcion;
    if (entrada.estado !== undefined) updates.estado = entrada.estado;

    const result = await this.especialidades.update(
      { id: entrada.id, institucionId: entrada.institucionId },
      updates,
    );
    return (result.affected ?? 0) > 0;
  }

  async docenteTieneEspecialidadActiva(
    idDocente: string,
    idEspecialidad: string,
    excluirId?: string,
  ): Promise<boolean> {
    const qb = this.asignaciones
      .createQueryBuilder('a')
      .where(
        'a.docenteId = :idDocente AND a.especialidadId = :idEspecialidad AND a.estado = :estado',
        { idDocente, idEspecialidad, estado: 'ACTIVA' },
      );
    if (excluirId) qb.andWhere('a.id != :excluirId', { excluirId });
    return (await qb.getCount()) > 0;
  }

  async existeEspecialidadPrincipalActiva(
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

  async crearAsignacionEspecialidad(entrada: {
    institucionId: string;
    idDocente: string;
    idEspecialidad: string;
    esPrincipal: boolean;
    aniosExperiencia?: number | null;
  }): Promise<{ id: string }> {
    const entidad = this.asignaciones.create({
      institucionId: entrada.institucionId,
      docenteId: entrada.idDocente,
      especialidadId: entrada.idEspecialidad,
      esPrincipal: entrada.esPrincipal,
      aniosExperiencia: entrada.aniosExperiencia ?? null,
      estado: 'ACTIVA',
    });
    const guardado = await this.asignaciones.save(entidad);
    return { id: guardado.id };
  }

  async obtenerAsignacionEspecialidadBase(
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

  async actualizarAsignacionEspecialidad(entrada: {
    idAsignacion: string;
    idDocente: string;
    institucionId: string;
    esPrincipal?: boolean;
    aniosExperiencia?: number | null;
    estado?: string;
  }): Promise<boolean> {
    const updates: Partial<DocenteEspecialidadTypeormEntidad> = {};
    if (entrada.esPrincipal !== undefined)
      updates.esPrincipal = entrada.esPrincipal;
    if (entrada.aniosExperiencia !== undefined)
      updates.aniosExperiencia = entrada.aniosExperiencia;
    if (entrada.estado !== undefined) updates.estado = entrada.estado;

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

  async quitarPrincipalAsignacionesEspecialidad(
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
}
