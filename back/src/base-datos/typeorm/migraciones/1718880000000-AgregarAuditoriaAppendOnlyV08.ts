import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarAuditoriaAppendOnlyV081718880000000 implements MigrationInterface {
  name = 'AgregarAuditoriaAppendOnlyV081718880000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE eventos_auditoria (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_institucion_educativa uuid REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_sede uuid REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_usuario uuid REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      accion varchar(120) NOT NULL,
      recurso varchar(100) NOT NULL,
      id_recurso varchar(100),
      resultado varchar(20) NOT NULL,
      datos_anteriores jsonb,
      datos_nuevos jsonb,
      metadatos jsonb,
      id_correlacion uuid NOT NULL,
      direccion_ip inet,
      agente_usuario varchar(500),
      fecha_evento timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(
      `CREATE INDEX ix_eventos_auditoria_correlacion ON eventos_auditoria (id_correlacion)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_eventos_auditoria_fecha ON eventos_auditoria (fecha_evento)`,
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION bloquear_mutacion_eventos_auditoria() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'eventos_auditoria es append-only';
      END;
    $$ LANGUAGE plpgsql`);
    await queryRunner.query(
      `CREATE TRIGGER tr_eventos_auditoria_no_update BEFORE UPDATE ON eventos_auditoria FOR EACH ROW EXECUTE FUNCTION bloquear_mutacion_eventos_auditoria()`,
    );
    await queryRunner.query(
      `CREATE TRIGGER tr_eventos_auditoria_no_delete BEFORE DELETE ON eventos_auditoria FOR EACH ROW EXECUTE FUNCTION bloquear_mutacion_eventos_auditoria()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS tr_eventos_auditoria_no_delete ON eventos_auditoria`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS tr_eventos_auditoria_no_update ON eventos_auditoria`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS bloquear_mutacion_eventos_auditoria()`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS ix_eventos_auditoria_fecha`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_eventos_auditoria_correlacion`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS eventos_auditoria`);
  }
}
