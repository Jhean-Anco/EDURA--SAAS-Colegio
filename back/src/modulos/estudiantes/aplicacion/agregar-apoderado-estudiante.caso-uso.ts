/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AgregarApoderadoEstudianteCasoUso {
  constructor(private readonly ds: DataSource) {}

  async ejecutar(entrada: {
    institucionId: string;
    estudianteId: string;
    idPersona: string;
    parentesco: string;
    esPrincipal?: boolean;
    puedeRecoger?: boolean;
    recibeComunicaciones?: boolean;
  }): Promise<{ id: string }> {
    const estudiante = await this.ds.query(
      `SELECT id FROM estudiantes WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [entrada.estudianteId, entrada.institucionId],
    );
    if (!estudiante.length)
      throw new ForbiddenException('RECURSO_NO_ENCONTRADO');

    const persona = await this.ds.query(
      `SELECT id FROM personas WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [entrada.idPersona, entrada.institucionId],
    );
    if (!persona.length) throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');

    if (entrada.esPrincipal) {
      const principal = await this.ds.query(
        `SELECT 1 FROM apoderados_estudiante
         WHERE id_estudiante = $1 AND id_institucion_educativa = $2
           AND estado = 'ACTIVO' AND es_principal = true
         LIMIT 1`,
        [entrada.estudianteId, entrada.institucionId],
      );
      if (principal.length) throw new ForbiddenException('YA_EXISTE_PRINCIPAL');
    }

    const [r] = await this.ds.query(
      `INSERT INTO apoderados_estudiante
         (id, id_institucion_educativa, id_estudiante, id_persona, parentesco, es_principal,
          puede_recoger, recibe_comunicaciones, estado, fecha_creacion, fecha_modificacion)
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
    return { id: r.id };
  }
}
