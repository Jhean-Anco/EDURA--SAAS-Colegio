import { MigrationInterface, QueryRunner } from 'typeorm';

export class EndurecerCurriculoPlanesEstudioV201719000000000 implements MigrationInterface {
  name = 'EndurecerCurriculoPlanesEstudioV201719000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar fecha_vigencia y id_usuario_activador a planes_estudio
    await queryRunner.query(`
      ALTER TABLE planes_estudio
      ADD COLUMN fecha_vigencia timestamptz NULL,
      ADD COLUMN id_usuario_activador uuid NULL
    `);

    // 2. Agregar FKs a usuarios para id_usuario_aprobador e id_usuario_activador
    await queryRunner.query(`
      ALTER TABLE planes_estudio
      ADD CONSTRAINT pe_fk_usuario_aprobador FOREIGN KEY (id_usuario_aprobador)
        REFERENCES usuarios(id) ON DELETE RESTRICT,
      ADD CONSTRAINT pe_fk_usuario_activador FOREIGN KEY (id_usuario_activador)
        REFERENCES usuarios(id) ON DELETE RESTRICT
    `);

    // 3. Agregar CHECK constraint para asegurar congruencia de estado y auditoría
    await queryRunner.query(`
      ALTER TABLE planes_estudio
      ADD CONSTRAINT pe_chk_aprobacion_coherente CHECK (
        (estado = 'BORRADOR' AND fecha_aprobacion IS NULL AND id_usuario_aprobador IS NULL) OR
        (estado = 'ANULADO') OR
        (estado IN ('APROBADO', 'VIGENTE', 'CERRADO') AND fecha_aprobacion IS NOT NULL AND id_usuario_aprobador IS NOT NULL)
      ),
      ADD CONSTRAINT pe_chk_vigencia_coherente CHECK (
        (estado IN ('BORRADOR', 'APROBADO', 'ANULADO') AND fecha_vigencia IS NULL AND id_usuario_activador IS NULL) OR
        (estado IN ('VIGENTE', 'CERRADO') AND fecha_vigencia IS NOT NULL AND id_usuario_activador IS NOT NULL)
      )
    `);

    // 4. Agregar indexación óptima
    await queryRunner.query(`
      CREATE INDEX idx_pe_anio_grado_estado ON planes_estudio (id_anio_academico, id_grado_educativo, estado);
      CREATE INDEX idx_dpe_plan_asignatura ON detalles_plan_estudio (id_plan_estudio, id_asignatura);
    `);

    // 5. Agregar checks de strings no vacíos (trim(X) <> '')
    await queryRunner.query(`
      ALTER TABLE asignaturas ADD CONSTRAINT asig_chk_codigo_no_vacio CHECK (trim(codigo) <> '');
      ALTER TABLE asignaturas ADD CONSTRAINT asig_chk_nombre_no_vacio CHECK (trim(nombre) <> '');
      ALTER TABLE planes_estudio ADD CONSTRAINT pe_chk_codigo_no_vacio CHECK (trim(codigo) <> '');
      ALTER TABLE planes_estudio ADD CONSTRAINT pe_chk_nombre_no_vacio CHECK (trim(nombre) <> '');
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // 5. Remover checks de strings no vacíos
    await queryRunner.query(
      `ALTER TABLE planes_estudio DROP CONSTRAINT IF EXISTS pe_chk_nombre_no_vacio`,
    );
    await queryRunner.query(
      `ALTER TABLE planes_estudio DROP CONSTRAINT IF EXISTS pe_chk_codigo_no_vacio`,
    );
    await queryRunner.query(
      `ALTER TABLE asignaturas DROP CONSTRAINT IF EXISTS asig_chk_nombre_no_vacio`,
    );
    await queryRunner.query(
      `ALTER TABLE asignaturas DROP CONSTRAINT IF EXISTS asig_chk_codigo_no_vacio`,
    );

    // 4. Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_dpe_plan_asignatura`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_pe_anio_grado_estado`);

    // 3. Remover checks coherentes
    await queryRunner.query(
      `ALTER TABLE planes_estudio DROP CONSTRAINT pe_chk_vigencia_coherente`,
    );
    await queryRunner.query(
      `ALTER TABLE planes_estudio DROP CONSTRAINT pe_chk_aprobacion_coherente`,
    );

    // 2. Remover FKs
    await queryRunner.query(
      `ALTER TABLE planes_estudio DROP CONSTRAINT pe_fk_usuario_activador`,
    );
    await queryRunner.query(
      `ALTER TABLE planes_estudio DROP CONSTRAINT pe_fk_usuario_aprobador`,
    );

    // 1. Remover columnas nuevas
    await queryRunner.query(`
      ALTER TABLE planes_estudio
      DROP COLUMN id_usuario_activador,
      DROP COLUMN fecha_vigencia
    `);
  }
}
