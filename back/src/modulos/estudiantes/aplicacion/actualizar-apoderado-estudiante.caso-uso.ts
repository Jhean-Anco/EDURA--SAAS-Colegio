/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ActualizarApoderadoEstudianteCasoUso {
  constructor(private readonly ds: DataSource) {}

  async ejecutar(entrada: {
    institucionId: string;
    estudianteId: string;
    idApoderado: string;
    parentesco?: string;
    esPrincipal?: boolean;
    puedeRecoger?: boolean;
    recibeComunicaciones?: boolean;
    estado?: string;
  }): Promise<void> {
    const ap = await this.ds.query(
      `SELECT id, es_principal FROM apoderados_estudiante
       WHERE id = $1 AND id_estudiante = $2 AND id_institucion_educativa = $3
       LIMIT 1`,
      [entrada.idApoderado, entrada.estudianteId, entrada.institucionId],
    );
    if (!ap.length) throw new ForbiddenException('RECURSO_NO_ENCONTRADO');

    if (entrada.esPrincipal === true && !ap[0].es_principal) {
      const principal = await this.ds.query(
        `SELECT 1 FROM apoderados_estudiante
         WHERE id_estudiante = $1 AND id_institucion_educativa = $2
           AND estado = 'ACTIVO' AND es_principal = true
         LIMIT 1`,
        [entrada.estudianteId, entrada.institucionId],
      );
      if (principal.length) throw new ForbiddenException('YA_EXISTE_PRINCIPAL');
    }

    await this.ds.query(
      `UPDATE apoderados_estudiante
         SET parentesco = COALESCE($4, parentesco),
             es_principal = COALESCE($5, es_principal),
             puede_recoger = COALESCE($6, puede_recoger),
             recibe_comunicaciones = COALESCE($7, recibe_comunicaciones),
             estado = COALESCE($8, estado),
             fecha_modificacion = now()
       WHERE id = $1 AND id_estudiante = $2 AND id_institucion_educativa = $3`,
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
  }
}
