import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarEvaluacionesConservacionElementoV041718840000000 implements MigrationInterface {
  name = 'AgregarEvaluacionesConservacionElementoV041718840000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE evaluaciones_conservacion_elemento (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_elemento_infraestructura uuid NOT NULL,
        id_estado_conservacion uuid NOT NULL,
        fecha_evaluacion date NOT NULL,
        observacion text,
        id_usuario_evaluador uuid,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_evaluaciones_conservacion_elemento_elementos_infraestructura FOREIGN KEY (id_elemento_infraestructura) REFERENCES elementos_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_evaluaciones_conservacion_elemento_estados_conservacion FOREIGN KEY (id_estado_conservacion) REFERENCES estados_conservacion(id) ON DELETE RESTRICT ON UPDATE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE INDEX ix_evaluaciones_conservacion_elemento_elemento_fecha
      ON evaluaciones_conservacion_elemento (id_elemento_infraestructura, fecha_evaluacion)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_evaluaciones_conservacion_elemento_elemento_fecha`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS evaluaciones_conservacion_elemento`,
    );
  }
}
