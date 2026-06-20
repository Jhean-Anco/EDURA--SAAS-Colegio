import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearAniosPeriodosAcademicosV121718920000000 implements MigrationInterface {
  name = 'CrearAniosPeriodosAcademicosV121718920000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE anios_academicos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa UUID NOT NULL
          REFERENCES instituciones_educativas(id),
        nombre VARCHAR(100) NOT NULL,
        anio INTEGER NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADO',
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
        fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT ck_anio_estado
          CHECK (estado IN ('PLANIFICADO', 'EN_CURSO', 'CERRADO', 'ANULADO')),
        CONSTRAINT ck_anio_fechas
          CHECK (fecha_fin > fecha_inicio),
        CONSTRAINT uq_anio_por_institucion
          UNIQUE (id_institucion_educativa, anio)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_anios_academicos_institucion
        ON anios_academicos (id_institucion_educativa)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_anios_academicos_estado
        ON anios_academicos (id_institucion_educativa, estado)
        WHERE estado NOT IN ('ANULADO')
    `);

    await queryRunner.query(`
      CREATE TABLE periodos_academicos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_anio_academico UUID NOT NULL
          REFERENCES anios_academicos(id),
        id_institucion_educativa UUID NOT NULL
          REFERENCES instituciones_educativas(id),
        nombre VARCHAR(100) NOT NULL,
        tipo VARCHAR(30) NOT NULL,
        orden INTEGER NOT NULL DEFAULT 1,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'PLANIFICADO',
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
        fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT ck_periodo_estado
          CHECK (estado IN ('PLANIFICADO', 'EN_CURSO', 'CERRADO', 'ANULADO')),
        CONSTRAINT ck_periodo_tipo
          CHECK (tipo IN ('BIMESTRE', 'TRIMESTRE', 'SEMESTRE', 'CUATRIMESTRE', 'OTRO')),
        CONSTRAINT ck_periodo_fechas
          CHECK (fecha_fin > fecha_inicio),
        CONSTRAINT uq_periodo_orden_en_anio
          UNIQUE (id_anio_academico, orden)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_periodos_anio
        ON periodos_academicos (id_anio_academico)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_periodos_institucion_estado
        ON periodos_academicos (id_institucion_educativa, estado)
        WHERE estado NOT IN ('ANULADO')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS periodos_academicos`);
    await queryRunner.query(`DROP TABLE IF EXISTS anios_academicos`);
  }
}
