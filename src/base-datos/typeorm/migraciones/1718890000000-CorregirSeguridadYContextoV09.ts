import { MigrationInterface, QueryRunner } from 'typeorm';

export class CorregirSeguridadYContextoV091718890000000 implements MigrationInterface {
  name = 'CorregirSeguridadYContextoV091718890000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE membresias_institucion
      ADD COLUMN IF NOT EXISTS id_persona uuid NULL
    `);
    await queryRunner.query(`
      ALTER TABLE membresias_institucion
      ADD CONSTRAINT IF NOT EXISTS fk_membresias_institucion_persona
      FOREIGN KEY (id_persona) REFERENCES personas(id)
      ON UPDATE CASCADE ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_membresias_institucion_persona
      ON membresias_institucion (id_persona)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_membresias_institucion_institucion_estado
      ON membresias_institucion (id_institucion_educativa, estado)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_membresias_institucion_usuario_estado
      ON membresias_institucion (id_usuario, estado)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_membresias_institucion_usuario_estado`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_membresias_institucion_institucion_estado`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_membresias_institucion_persona`,
    );
    await queryRunner.query(`
      ALTER TABLE membresias_institucion
      DROP CONSTRAINT IF EXISTS fk_membresias_institucion_persona
    `);
    await queryRunner.query(`
      ALTER TABLE membresias_institucion
      DROP COLUMN IF EXISTS id_persona
    `);
  }
}
