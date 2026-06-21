/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  DatosEstudianteCreacion,
  RepositorioEstudiantes,
} from '../../../../dominio/puertos/estudiantes.puerto';

@Injectable()
export class EstudiantesTypeormRepositorio implements RepositorioEstudiantes {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async verificarSedeDeInstitucion(
    idSede: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `SELECT 1 FROM sedes WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [idSede, institucionId],
    );
    return rows.length > 0;
  }

  async verificarPersonaDeInstitucion(
    idPersona: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `SELECT 1 FROM personas WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [idPersona, institucionId],
    );
    return rows.length > 0;
  }

  async existeCodigo(
    codigo: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `SELECT 1 FROM estudiantes
       WHERE id_institucion_educativa = $1 AND codigo = $2
         AND ($3::uuid IS NULL OR id <> $3)
       LIMIT 1`,
      [institucionId, codigo, excluirId ?? null],
    );
    return rows.length > 0;
  }

  async personaYaEsEstudiante(
    idPersona: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `SELECT 1 FROM estudiantes
       WHERE id_institucion_educativa = $1 AND id_persona = $2
         AND ($3::uuid IS NULL OR id <> $3)
       LIMIT 1`,
      [institucionId, idPersona, excluirId ?? null],
    );
    return rows.length > 0;
  }

  async crearEstudiante(entrada: {
    institucionId: string;
    idPersona: string;
    idSede: string;
    codigo: string;
    fechaIngreso?: string | null;
    observacion?: string | null;
  }): Promise<DatosEstudianteCreacion> {
    const [row] = await this.ds.query(
      `INSERT INTO estudiantes
         (id, id_institucion_educativa, id_sede, id_persona, codigo, estado,
          fecha_ingreso, observacion, fecha_creacion, fecha_modificacion)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVO', $5, $6, now(), now())
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.idSede,
        entrada.idPersona,
        entrada.codigo,
        entrada.fechaIngreso ?? null,
        entrada.observacion ?? null,
      ],
    );
    return { id: row.id as string };
  }

  async obtenerEstudianteBase(
    id: string,
    institucionId: string,
  ): Promise<{ id: string; idSede: string; idPersona: string } | null> {
    const rows = await this.ds.query(
      `SELECT id, id_sede as "idSede", id_persona as "idPersona"
       FROM estudiantes
       WHERE id = $1 AND id_institucion_educativa = $2
       LIMIT 1`,
      [id, institucionId],
    );
    return (
      (rows[0] as
        | { id: string; idSede: string; idPersona: string }
        | undefined) ?? null
    );
  }

  async actualizarEstudiante(entrada: {
    id: string;
    institucionId: string;
    codigo?: string;
    idSede?: string | null;
    fechaIngreso?: string | null;
    observacion?: string | null;
  }): Promise<boolean> {
    const rows = await this.ds.query(
      `UPDATE estudiantes
         SET codigo        = COALESCE($3, codigo),
             id_sede       = COALESCE($4, id_sede),
             fecha_ingreso = COALESCE($5, fecha_ingreso),
             observacion   = COALESCE($6, observacion),
             fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2
       RETURNING id`,
      [
        entrada.id,
        entrada.institucionId,
        entrada.codigo ?? null,
        entrada.idSede ?? null,
        entrada.fechaIngreso ?? null,
        entrada.observacion ?? null,
      ],
    );
    return rows.length > 0;
  }

  async cambiarEstadoEstudiante(
    id: string,
    institucionId: string,
    estado: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `UPDATE estudiantes
         SET estado = $3, fecha_modificacion = now()
       WHERE id = $1 AND id_institucion_educativa = $2
       RETURNING id`,
      [id, institucionId, estado],
    );
    return rows.length > 0;
  }

  async estudianteTienePrincipalActivo(
    estudianteId: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `SELECT 1 FROM apoderados_estudiante
       WHERE id_estudiante = $1 AND id_institucion_educativa = $2
         AND estado = 'ACTIVO' AND es_principal = true
       LIMIT 1`,
      [estudianteId, institucionId],
    );
    return rows.length > 0;
  }

  async apoderadoPrincipalActivo(
    estudianteId: string,
    institucionId: string,
    excluirId?: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `SELECT 1 FROM apoderados_estudiante
       WHERE id_estudiante = $1 AND id_institucion_educativa = $2
         AND estado = 'ACTIVO' AND es_principal = true
         AND ($3::uuid IS NULL OR id <> $3)
       LIMIT 1`,
      [estudianteId, institucionId, excluirId ?? null],
    );
    return rows.length > 0;
  }

  async crearApoderado(entrada: {
    institucionId: string;
    estudianteId: string;
    idPersona: string;
    parentesco: string;
    esPrincipal?: boolean;
    puedeRecoger?: boolean;
    recibeComunicaciones?: boolean;
  }): Promise<{ id: string }> {
    const [row] = await this.ds.query(
      `INSERT INTO apoderados_estudiante
         (id, id_institucion_educativa, id_estudiante, id_persona, parentesco,
          es_principal, puede_recoger, recibe_comunicaciones, estado,
          fecha_creacion, fecha_modificacion)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'ACTIVO', now(), now())
       RETURNING id`,
      [
        entrada.institucionId,
        entrada.estudianteId,
        entrada.idPersona,
        entrada.parentesco,
        !!entrada.esPrincipal,
        !!entrada.puedeRecoger,
        entrada.recibeComunicaciones ?? true,
      ],
    );
    return { id: row.id as string };
  }

  async obtenerApoderadoBase(
    idApoderado: string,
    estudianteId: string,
    institucionId: string,
  ): Promise<{ id: string; esPrincipal: boolean } | null> {
    const rows = await this.ds.query(
      `SELECT id, es_principal as "esPrincipal"
       FROM apoderados_estudiante
       WHERE id = $1 AND id_estudiante = $2 AND id_institucion_educativa = $3
       LIMIT 1`,
      [idApoderado, estudianteId, institucionId],
    );
    return (
      (rows[0] as { id: string; esPrincipal: boolean } | undefined) ?? null
    );
  }

  async actualizarApoderado(entrada: {
    idApoderado: string;
    estudianteId: string;
    institucionId: string;
    parentesco?: string | null;
    esPrincipal?: boolean | null;
    puedeRecoger?: boolean | null;
    recibeComunicaciones?: boolean | null;
    estado?: string | null;
  }): Promise<boolean> {
    const rows = await this.ds.query(
      `UPDATE apoderados_estudiante
         SET parentesco            = COALESCE($4, parentesco),
             es_principal          = COALESCE($5, es_principal),
             puede_recoger         = COALESCE($6, puede_recoger),
             recibe_comunicaciones = COALESCE($7, recibe_comunicaciones),
             estado                = COALESCE($8, estado),
             fecha_modificacion    = now()
       WHERE id = $1 AND id_estudiante = $2 AND id_institucion_educativa = $3
       RETURNING id`,
      [
        entrada.idApoderado,
        entrada.estudianteId,
        entrada.institucionId,
        entrada.parentesco ?? null,
        entrada.esPrincipal ?? null,
        entrada.puedeRecoger ?? null,
        entrada.recibeComunicaciones ?? null,
        entrada.estado ?? null,
      ],
    );
    return rows.length > 0;
  }

  async estudianteExiste(
    estudianteId: string,
    institucionId: string,
  ): Promise<boolean> {
    const rows = await this.ds.query(
      `SELECT 1 FROM estudiantes
       WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [estudianteId, institucionId],
    );
    return rows.length > 0;
  }

  async registrarDocumento(entrada: {
    institucionId: string;
    estudianteId: string;
    tipoDocumento: string;
    nombre: string;
    fechaEmision?: string | null;
    fechaVencimiento?: string | null;
    observacion?: string | null;
  }): Promise<void> {
    await this.ds.query(
      `INSERT INTO documentos_estudiante
         (id, id_institucion_educativa, id_estudiante, tipo_documento, nombre, estado,
          fecha_emision, fecha_vencimiento, observacion, fecha_creacion, fecha_modificacion)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDIENTE', $5, $6, $7, now(), now())`,
      [
        entrada.institucionId,
        entrada.estudianteId,
        entrada.tipoDocumento,
        entrada.nombre,
        entrada.fechaEmision ?? null,
        entrada.fechaVencimiento ?? null,
        entrada.observacion ?? null,
      ],
    );
  }
}
