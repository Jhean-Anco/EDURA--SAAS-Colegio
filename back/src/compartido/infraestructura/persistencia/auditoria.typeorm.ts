import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import {
  EntradaEventoAuditoria,
  ServicioAuditoria,
} from '../../aplicacion/auditoria.puerto';

@Injectable()
export class AuditoriaTypeorm implements ServicioAuditoria {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private esUuidValido(uuid: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  async registrar(entrada: EntradaEventoAuditoria): Promise<void> {
    try {
      const correlationId = this.esUuidValido(entrada.idCorrelacion)
        ? entrada.idCorrelacion
        : randomUUID();

      await this.ds.query(
        `INSERT INTO eventos_auditoria
           (id_institucion_educativa, id_sede, id_usuario,
            accion, recurso, id_recurso, resultado,
            datos_anteriores, datos_nuevos, metadatos, id_correlacion,
            direccion_ip, agente_usuario)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
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
          correlationId,
          entrada.direccionIp ?? null,
          entrada.agenteUsuario ?? null,
        ],
      );
    } catch {
      // La auditoría nunca debe interrumpir el flujo principal
    }
  }
}
