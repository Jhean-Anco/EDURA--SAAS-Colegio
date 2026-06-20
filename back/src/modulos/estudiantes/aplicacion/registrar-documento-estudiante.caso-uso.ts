/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RegistrarDocumentoEstudianteCasoUso {
  constructor(private readonly ds: DataSource) {}

  async ejecutar(entrada: {
    institucionId: string;
    estudianteId: string;
    tipoDocumento: string;
    nombre: string;
    fechaEmision?: string | null;
    fechaVencimiento?: string | null;
    observacion?: string | null;
  }): Promise<void> {
    const estudiante = await this.ds.query(
      `SELECT id FROM estudiantes WHERE id = $1 AND id_institucion_educativa = $2 LIMIT 1`,
      [entrada.estudianteId, entrada.institucionId],
    );
    if (!estudiante.length)
      throw new ForbiddenException('RECURSO_NO_ENCONTRADO');
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
