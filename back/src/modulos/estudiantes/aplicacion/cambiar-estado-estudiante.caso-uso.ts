/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { DataSource } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
export class CambiarEstadoEstudianteCasoUso {
  constructor(private readonly ds: DataSource) {}
  async ejecutar(entrada: {
    institucionId: string;
    id: string;
    estado: string;
  }): Promise<void> {
    const res = await this.ds.query(
      `UPDATE estudiantes SET estado = $3, fecha_modificacion = now() WHERE id = $1 AND id_institucion_educativa = $2`,
      [entrada.id, entrada.institucionId, entrada.estado],
    );
    if (!res?.rowCount && res?.length === 0)
      throw new ForbiddenException('RECURSO_NO_ENCONTRADO');
  }
}
