import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionRolUsuarioTypeormEntidad } from '../../../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/seguridad.typeorm-entidades';

export const CONSULTADOR_PERMISOS_EFECTIVOS = Symbol(
  'CONSULTADOR_PERMISOS_EFECTIVOS',
);

export interface ConsultadorPermisosEfectivos {
  listar(entrada: {
    usuarioId: string;
    rolId: string | null;
    institucionId: string | null;
    sedeId: string | null;
  }): Promise<string[]>;
}

@Injectable()
export class ConsultadorPermisosEfectivosTypeorm implements ConsultadorPermisosEfectivos {
  constructor(
    @InjectRepository(AsignacionRolUsuarioTypeormEntidad)
    private readonly asignaciones: Repository<AsignacionRolUsuarioTypeormEntidad>,
  ) {}

  async listar(entrada: {
    usuarioId: string;
    rolId: string | null;
    institucionId: string | null;
    sedeId: string | null;
  }): Promise<string[]> {
    if (!entrada.rolId) {
      return [];
    }

    const filas = await this.asignaciones.manager.query<{ codigo: string }[]>(
      `
      SELECT DISTINCT p.codigo
      FROM asignaciones_rol_usuario aru
      JOIN roles r ON r.id = aru.id_rol AND r.activo = true
      JOIN roles_permisos rp ON rp.id_rol = r.id
      JOIN permisos p ON p.id = rp.id_permiso AND p.activo = true
      WHERE aru.id_usuario = $1
        AND aru.id_rol = $2
        AND aru.estado = 'ACTIVA'
        AND (aru.fecha_fin IS NULL OR aru.fecha_fin > now())
      `,
      [entrada.usuarioId, entrada.rolId],
    );

    return filas.map((f) => f.codigo);
  }
}
