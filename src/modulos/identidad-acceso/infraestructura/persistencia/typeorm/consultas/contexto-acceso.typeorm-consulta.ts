import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultadorContextosAcceso } from '../../../../dominio/puertos/repositorios';
import { ContextoAcceso } from '../../../../dominio/puertos/repositorios';
import {
  AsignacionRolUsuarioTypeormEntidad,
  MembresiaInstitucionTypeormEntidad,
  RolTypeormEntidad,
} from '../entidades/seguridad.typeorm-entidades';
import { InstitucionEducativaTypeormEntidad } from '../../../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';
import { SedeTypeormEntidad } from '../../../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';

@Injectable()
export class ContextoAccesoTypeormConsulta implements ConsultadorContextosAcceso {
  constructor(
    @InjectRepository(AsignacionRolUsuarioTypeormEntidad)
    private readonly asignaciones: Repository<AsignacionRolUsuarioTypeormEntidad>,
    @InjectRepository(MembresiaInstitucionTypeormEntidad)
    private readonly membresias: Repository<MembresiaInstitucionTypeormEntidad>,
    @InjectRepository(RolTypeormEntidad)
    private readonly roles: Repository<RolTypeormEntidad>,
    @InjectRepository(InstitucionEducativaTypeormEntidad)
    private readonly instituciones: Repository<InstitucionEducativaTypeormEntidad>,
    @InjectRepository(SedeTypeormEntidad)
    private readonly sedes: Repository<SedeTypeormEntidad>,
  ) {}

  async listarPorUsuario(usuarioId: string): Promise<ContextoAcceso[]> {
    const asignaciones = await this.asignaciones.find({
      where: { usuarioId, estado: 'ACTIVA' },
    });
    const roles = new Map(
      (await this.roles.find({ where: { activo: true } })).map((rol) => [
        rol.id,
        rol,
      ]),
    );
    const membresias = new Map(
      (
        await this.membresias.find({
          where: { usuarioId, estado: 'ACTIVA' },
        })
      ).map((membresia) => [membresia.id, membresia]),
    );
    const institucionesIds = new Set<string>();
    const sedesIds = new Set<string>();
    for (const asignacion of asignaciones) {
      if (asignacion.membresiaInstitucionId) {
        const membresia = membresias.get(asignacion.membresiaInstitucionId);
        if (membresia) {
          institucionesIds.add(membresia.institucionEducativaId);
        }
      }
      if (asignacion.sedeId) {
        sedesIds.add(asignacion.sedeId);
      }
    }
    const instituciones = new Map(
      (
        await this.instituciones.find({
          where: [...institucionesIds].map((id) => ({ id })),
        })
      ).map((institucion) => [institucion.id, institucion]),
    );
    const sedes = new Map(
      (
        await this.sedes.find({ where: [...sedesIds].map((id) => ({ id })) })
      ).map((sede) => [sede.id, sede]),
    );

    const contextos: ContextoAcceso[] = [];
    for (const asignacion of asignaciones) {
      const rol = roles.get(asignacion.rolId);
      if (!rol) {
        continue;
      }
      if (rol.ambito === 'PLATAFORMA') {
        contextos.push({
          ambito: 'PLATAFORMA',
          rolId: rol.id,
          rolCodigo: rol.codigo,
          institucionId: null,
          institucionNombre: null,
          sedeId: null,
          sedeNombre: null,
        });
        continue;
      }
      if (asignacion.membresiaInstitucionId) {
        const membresia = membresias.get(asignacion.membresiaInstitucionId);
        const institucion = membresia
          ? instituciones.get(membresia.institucionEducativaId)
          : null;
        if (rol.ambito === 'INSTITUCION' && membresia && institucion) {
          contextos.push({
            ambito: 'INSTITUCION',
            rolId: rol.id,
            rolCodigo: rol.codigo,
            institucionId: institucion.id,
            institucionNombre: institucion.nombreLegal,
            sedeId: null,
            sedeNombre: null,
          });
        }
        if (
          rol.ambito === 'SEDE' &&
          membresia &&
          institucion &&
          asignacion.sedeId
        ) {
          const sede = sedes.get(asignacion.sedeId);
          if (sede && sede.institucionEducativaId === institucion.id) {
            contextos.push({
              ambito: 'SEDE',
              rolId: rol.id,
              rolCodigo: rol.codigo,
              institucionId: institucion.id,
              institucionNombre: institucion.nombreLegal,
              sedeId: sede.id,
              sedeNombre: sede.nombre,
            });
          }
        }
      }
    }
    const deduplicados = new Map<string, ContextoAcceso>();
    for (const contexto of contextos) {
      const llave = [
        contexto.ambito,
        contexto.rolId,
        contexto.institucionId ?? '',
        contexto.sedeId ?? '',
      ].join(':');
      if (!deduplicados.has(llave)) {
        deduplicados.set(llave, contexto);
      }
    }
    return [...deduplicados.values()];
  }
}
