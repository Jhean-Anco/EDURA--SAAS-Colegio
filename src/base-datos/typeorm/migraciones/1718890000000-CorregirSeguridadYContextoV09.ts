import { MigrationInterface, QueryRunner } from 'typeorm';

export class CorregirSeguridadYContextoV091718890000000 implements MigrationInterface {
  name = 'CorregirSeguridadYContextoV091718890000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
