import { MigrationInterface, QueryRunner } from 'typeorm';

export class PrepararIntegridadSedesParaDocentesV14_51718945000000
  implements MigrationInterface
{
  name = 'PrepararIntegridadSedesParaDocentesV14_51718945000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Garantiza que la restricción compuesta UNIQUE(id, id_institucion_educativa)
    // exista en sedes antes de que V15 cree las FKs compuestas de docentes.
    // Idempotente: usa DO NOTHING si ya existe.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'uq_sedes_id_institucion'
            AND conrelid = 'sedes'::regclass
        ) THEN
          ALTER TABLE sedes
            ADD CONSTRAINT uq_sedes_id_institucion
            UNIQUE (id, id_institucion_educativa);
        END IF;
      END
      $$
    `);

    // Garantiza la misma restricción en personas (requerida por docentes.fk_docentes_persona_institucion).
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'uq_personas_id_institucion'
            AND conrelid = 'personas'::regclass
        ) THEN
          ALTER TABLE personas
            ADD CONSTRAINT uq_personas_id_institucion
            UNIQUE (id, id_institucion_educativa);
        END IF;
      END
      $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE personas DROP CONSTRAINT IF EXISTS uq_personas_id_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE sedes DROP CONSTRAINT IF EXISTS uq_sedes_id_institucion`,
    );
  }
}
