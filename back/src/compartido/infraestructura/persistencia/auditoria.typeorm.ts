import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EntradaEventoAuditoria,
  ServicioAuditoria,
} from '../../aplicacion/auditoria.puerto';

@Injectable()
export class AuditoriaTypeorm implements ServicioAuditoria {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async registrar(entrada: EntradaEventoAuditoria): Promise<void> {
    try {
      await this.ds.query(
        `INSERT INTO eventos_auditoria
           (id_institucion_educativa, id_sede, id_usuario,
            accion, recurso, id_recurso, resultado,
            datos_anteriores, datos_nuevos, metadatos, id_correlacion)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          entrada.institucionId,
          entrada.sedeId ?? null,
          entrada.usuarioId,
          entrada.accion,
          entrada.recurso,
          entrada.idRecurso ?? null,
          entrada.resultado,
          entrada.datosAnteriores
            ? JSON.stringify(entrada.datosAnteriores)
            : null,
          entrada.datosNuevos ? JSON.stringify(entrada.datosNuevos) : null,
          entrada.metadatos ? JSON.stringify(entrada.metadatos) : null,
          entrada.idCorrelacion,
        ],
      );
    } catch {
      // La auditoría nunca debe interrumpir el flujo principal
    }
  }
}
