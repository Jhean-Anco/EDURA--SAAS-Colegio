/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';

export class ActualizarEstudianteCasoUso {
  constructor(private readonly ds: DataSource) {}
  async ejecutar(entrada: {
    institucionId: string;
    id: string;
    codigo?: string;
    idSede?: string;
    fechaIngreso?: string | null;
    observacion?: string | null;
  }): Promise<void> {
    const estudiante = await this.ds.query(
      `SELECT id FROM estudiantes WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [entrada.id, entrada.institucionId],
    );
    if (!estudiante.length)
      throw new ForbiddenException('RECURSO_NO_ENCONTRADO');
    if (entrada.idSede) {
      const sede = await this.ds.query(
        `SELECT 1 FROM sedes WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
        [entrada.idSede, entrada.institucionId],
      );
      if (!sede.length) throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    await this.ds.query(
      `UPDATE estudiantes SET codigo = COALESCE($3, codigo), id_sede = COALESCE($4, id_sede), fecha_ingreso = COALESCE($5, fecha_ingreso), observacion = COALESCE($6, observacion), fecha_modificacion = now() WHERE id = $1 AND id_institucion_educativa = $2`,
      [
        entrada.id,
        entrada.institucionId,
        entrada.codigo ?? null,
        entrada.idSede ?? null,
        entrada.fechaIngreso ?? null,
        entrada.observacion ?? null,
      ],
    );
  }
}
