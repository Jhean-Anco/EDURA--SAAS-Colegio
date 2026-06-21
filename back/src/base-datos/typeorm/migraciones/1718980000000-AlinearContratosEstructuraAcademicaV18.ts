import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlinearContratosEstructuraAcademicaV181718980000000 implements MigrationInterface {
  name = 'AlinearContratosEstructuraAcademicaV181718980000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Drop defaults that contradict V17 CHECK constraints (orden > 0)
    await queryRunner.query(
      `ALTER TABLE niveles_educativos ALTER COLUMN orden DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE grados_educativos ALTER COLUMN orden DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE periodos_academicos ALTER COLUMN orden DROP DEFAULT`,
    );

    // Fix secciones estado default to match new V17 constraint (PLANIFICADA is valid)
    await queryRunner.query(
      `ALTER TABLE secciones_academicas ALTER COLUMN estado SET DEFAULT 'PLANIFICADA'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // NOTE: These defaults (0 for orden, ACTIVA for estado) are incompatible with
    // V17 CHECK constraints when rows are inserted without explicit values.
    // This down() is only for technical reversibility; re-applying V17 is required
    // to have a working state.
    await queryRunner.query(
      `ALTER TABLE niveles_educativos ALTER COLUMN orden SET DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE grados_educativos ALTER COLUMN orden SET DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE periodos_academicos ALTER COLUMN orden SET DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE secciones_academicas ALTER COLUMN estado SET DEFAULT 'ACTIVA'`,
    );
  }
}
