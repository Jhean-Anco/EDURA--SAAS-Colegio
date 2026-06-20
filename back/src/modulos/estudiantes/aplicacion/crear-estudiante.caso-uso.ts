/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export class CrearEstudianteCasoUso {
  constructor(private readonly ds: DataSource) {}

  async ejecutar(entrada: {
    institucionId: string;
    idPersona: string;
    idSede: string;
    codigo: string;
    fechaIngreso?: string | null;
    observacion?: string | null;
  }): Promise<{ id: string }> {
    const sede = await this.ds.query(
      `SELECT id FROM sedes WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [entrada.idSede, entrada.institucionId],
    );
    if (!sede.length) throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    const persona = await this.ds.query(
      `SELECT id FROM personas WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [entrada.idPersona, entrada.institucionId],
    );
    if (!persona.length) throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    const codigoExiste = await this.ds.query(
      `SELECT 1 FROM estudiantes WHERE id_institucion_educativa = $1 AND codigo = $2 LIMIT 1`,
      [entrada.institucionId, entrada.codigo],
    );
    if (codigoExiste.length) throw new ForbiddenException('CODIGO_DUPLICADO');
    const personaAsociada = await this.ds.query(
      `SELECT 1 FROM estudiantes WHERE id_institucion_educativa = $1 AND id_persona = $2 LIMIT 1`,
      [entrada.institucionId, entrada.idPersona],
    );
    if (personaAsociada.length)
      throw new ForbiddenException('PERSONA_YA_ESTUDIANTE');
    const [r] = await this.ds.query(
      `INSERT INTO estudiantes (id, id_institucion_educativa, id_sede, id_persona, codigo, estado, fecha_ingreso, observacion, fecha_creacion, fecha_modificacion)
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
    return { id: r.id };
  }
}
