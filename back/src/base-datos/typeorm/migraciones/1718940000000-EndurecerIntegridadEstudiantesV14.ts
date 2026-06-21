import { MigrationInterface, QueryRunner } from 'typeorm';

export class EndurecerIntegridadEstudiantesV141718940000000 implements MigrationInterface {
  name = 'EndurecerIntegridadEstudiantesV141718940000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── estudiantes ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE estudiantes
      ADD CONSTRAINT ck_estudiantes_estado
      CHECK (estado IN ('ACTIVO', 'INACTIVO', 'RETIRADO', 'EGRESADO'))
    `);
    await queryRunner.query(`
      ALTER TABLE estudiantes
      ADD CONSTRAINT ck_estudiantes_codigo_no_vacio
      CHECK (trim(codigo) <> '')
    `);
    await queryRunner.query(`
      ALTER TABLE estudiantes
      ADD CONSTRAINT ck_estudiantes_fechas
      CHECK (
        fecha_retiro IS NULL OR
        fecha_ingreso IS NULL OR
        fecha_retiro >= fecha_ingreso
      )
    `);
    // FK compuesta estudiante → persona de la misma institución
    // Nota: UNIQUE(id, id_institucion_educativa) en personas ya existe desde V11
    await queryRunner.query(`
      ALTER TABLE estudiantes
      ADD CONSTRAINT fk_estudiantes_persona_institucion
      FOREIGN KEY (id_persona, id_institucion_educativa)
      REFERENCES personas (id, id_institucion_educativa)
      ON DELETE RESTRICT ON UPDATE RESTRICT
    `);
    // índice para acelerar búsquedas por institución+estado
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_estudiantes_institucion_estado
      ON estudiantes (id_institucion_educativa, estado)
    `);
    // índice parcial: solo un estudiante ACTIVO por persona en la institución
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_estudiantes_activo_persona_institucion
      ON estudiantes (id_institucion_educativa, id_persona)
      WHERE estado = 'ACTIVO'
    `);

    // ── apoderados_estudiante ──────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE apoderados_estudiante
      ADD CONSTRAINT ck_apoderados_estado
      CHECK (estado IN ('ACTIVO', 'INACTIVO'))
    `);
    await queryRunner.query(`
      ALTER TABLE apoderados_estudiante
      ADD CONSTRAINT ck_apoderados_parentesco_no_vacio
      CHECK (trim(parentesco) <> '')
    `);
    // FK compuesta apoderado → persona de la misma institución
    await queryRunner.query(`
      ALTER TABLE apoderados_estudiante
      ADD CONSTRAINT fk_apoderados_persona_institucion
      FOREIGN KEY (id_persona, id_institucion_educativa)
      REFERENCES personas (id, id_institucion_educativa)
      ON DELETE RESTRICT ON UPDATE RESTRICT
    `);
    // FK compuesta apoderado → estudiante de la misma institución
    await queryRunner.query(`
      ALTER TABLE estudiantes
      ADD CONSTRAINT uq_estudiantes_id_institucion
      UNIQUE (id, id_institucion_educativa)
    `);
    await queryRunner.query(`
      ALTER TABLE apoderados_estudiante
      ADD CONSTRAINT fk_apoderados_estudiante_institucion
      FOREIGN KEY (id_estudiante, id_institucion_educativa)
      REFERENCES estudiantes (id, id_institucion_educativa)
      ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    // ── documentos_estudiante ──────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE documentos_estudiante
      ADD CONSTRAINT ck_documentos_estudiante_estado
      CHECK (estado IN ('PENDIENTE', 'ENTREGADO', 'VENCIDO', 'ANULADO'))
    `);
    await queryRunner.query(`
      ALTER TABLE documentos_estudiante
      ADD CONSTRAINT ck_documentos_estudiante_tipo_no_vacio
      CHECK (trim(tipo_documento) <> '')
    `);
    await queryRunner.query(`
      ALTER TABLE documentos_estudiante
      ADD CONSTRAINT ck_documentos_estudiante_nombre_no_vacio
      CHECK (trim(nombre) <> '')
    `);
    await queryRunner.query(`
      ALTER TABLE documentos_estudiante
      ADD CONSTRAINT ck_documentos_estudiante_fechas
      CHECK (
        fecha_vencimiento IS NULL OR
        fecha_emision IS NULL OR
        fecha_vencimiento >= fecha_emision
      )
    `);
    // FK compuesta documento → estudiante de la misma institución
    await queryRunner.query(`
      ALTER TABLE documentos_estudiante
      ADD CONSTRAINT fk_documentos_estudiante_institucion
      FOREIGN KEY (id_estudiante, id_institucion_educativa)
      REFERENCES estudiantes (id, id_institucion_educativa)
      ON DELETE RESTRICT ON UPDATE RESTRICT
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_documentos_estudiante_estado
      ON documentos_estudiante (id_institucion_educativa, id_estudiante, estado)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // documentos_estudiante
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_documentos_estudiante_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE documentos_estudiante DROP CONSTRAINT IF EXISTS fk_documentos_estudiante_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE documentos_estudiante DROP CONSTRAINT IF EXISTS ck_documentos_estudiante_fechas`,
    );
    await queryRunner.query(
      `ALTER TABLE documentos_estudiante DROP CONSTRAINT IF EXISTS ck_documentos_estudiante_nombre_no_vacio`,
    );
    await queryRunner.query(
      `ALTER TABLE documentos_estudiante DROP CONSTRAINT IF EXISTS ck_documentos_estudiante_tipo_no_vacio`,
    );
    await queryRunner.query(
      `ALTER TABLE documentos_estudiante DROP CONSTRAINT IF EXISTS ck_documentos_estudiante_estado`,
    );

    // apoderados_estudiante
    await queryRunner.query(
      `ALTER TABLE apoderados_estudiante DROP CONSTRAINT IF EXISTS fk_apoderados_estudiante_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE estudiantes DROP CONSTRAINT IF EXISTS uq_estudiantes_id_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE apoderados_estudiante DROP CONSTRAINT IF EXISTS fk_apoderados_persona_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE apoderados_estudiante DROP CONSTRAINT IF EXISTS ck_apoderados_parentesco_no_vacio`,
    );
    await queryRunner.query(
      `ALTER TABLE apoderados_estudiante DROP CONSTRAINT IF EXISTS ck_apoderados_estado`,
    );

    // estudiantes
    await queryRunner.query(
      `DROP INDEX IF EXISTS ux_estudiantes_activo_persona_institucion`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_estudiantes_institucion_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE estudiantes DROP CONSTRAINT IF EXISTS fk_estudiantes_persona_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE estudiantes DROP CONSTRAINT IF EXISTS ck_estudiantes_fechas`,
    );
    await queryRunner.query(
      `ALTER TABLE estudiantes DROP CONSTRAINT IF EXISTS ck_estudiantes_codigo_no_vacio`,
    );
    await queryRunner.query(
      `ALTER TABLE estudiantes DROP CONSTRAINT IF EXISTS ck_estudiantes_estado`,
    );
  }
}
