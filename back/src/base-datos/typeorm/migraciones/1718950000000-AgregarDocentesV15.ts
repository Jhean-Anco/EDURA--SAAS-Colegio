import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarDocentesV151718950000000 implements MigrationInterface {
  name = 'AgregarDocentesV151718950000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── especialidades_profesionales ──────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE especialidades_profesionales (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        codigo varchar(40) NOT NULL,
        codigo_normalizado varchar(40) NOT NULL,
        nombre varchar(150) NOT NULL,
        nombre_normalizado varchar(150) NOT NULL,
        descripcion text,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_especialidades_id_institucion UNIQUE (id, id_institucion_educativa),
        CONSTRAINT uq_especialidades_institucion_codigo UNIQUE (id_institucion_educativa, codigo_normalizado),
        CONSTRAINT uq_especialidades_institucion_nombre UNIQUE (id_institucion_educativa, nombre_normalizado),
        CONSTRAINT ck_especialidades_estado CHECK (estado IN ('ACTIVA', 'INACTIVA')),
        CONSTRAINT ck_especialidades_codigo_no_vacio CHECK (trim(codigo) <> ''),
        CONSTRAINT ck_especialidades_nombre_no_vacio CHECK (trim(nombre) <> '')
      )
    `);
    await queryRunner.query(
      `CREATE INDEX ix_especialidades_profesionales_institucion_estado
       ON especialidades_profesionales (id_institucion_educativa, estado)`,
    );

    // ── docentes ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE docentes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        id_persona uuid NOT NULL
          REFERENCES personas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        codigo varchar(40) NOT NULL,
        codigo_normalizado varchar(40) NOT NULL,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVO',
        fecha_ingreso date,
        fecha_cese date,
        perfil_profesional text,
        observacion text,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_docentes_id_institucion UNIQUE (id, id_institucion_educativa),
        CONSTRAINT uq_docentes_institucion_codigo UNIQUE (id_institucion_educativa, codigo_normalizado),
        CONSTRAINT uq_docentes_institucion_persona UNIQUE (id_institucion_educativa, id_persona),
        CONSTRAINT fk_docentes_persona_institucion
          FOREIGN KEY (id_persona, id_institucion_educativa)
          REFERENCES personas (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_docentes_estado CHECK (estado IN ('ACTIVO', 'INACTIVO', 'CESADO')),
        CONSTRAINT ck_docentes_codigo_no_vacio CHECK (trim(codigo) <> ''),
        CONSTRAINT ck_docentes_fechas CHECK (
          fecha_cese IS NULL OR fecha_ingreso IS NULL OR fecha_cese >= fecha_ingreso
        )
      )
    `);
    await queryRunner.query(
      `CREATE INDEX ix_docentes_institucion_estado
       ON docentes (id_institucion_educativa, estado)`,
    );

    // ── asignaciones_docente_sede ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE asignaciones_docente_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        id_docente uuid NOT NULL,
        id_sede uuid NOT NULL,
        es_principal boolean NOT NULL DEFAULT false,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
        fecha_inicio date NOT NULL,
        fecha_fin date,
        observacion text,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_asignaciones_docente_sede_id_institucion
          UNIQUE (id, id_institucion_educativa),
        CONSTRAINT fk_asignaciones_docente_sede_docente_institucion
          FOREIGN KEY (id_docente, id_institucion_educativa)
          REFERENCES docentes (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_asignaciones_docente_sede_sede_institucion
          FOREIGN KEY (id_sede, id_institucion_educativa)
          REFERENCES sedes (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_asignaciones_docente_sede_estado
          CHECK (estado IN ('ACTIVA', 'INACTIVA')),
        CONSTRAINT ck_asignaciones_docente_sede_fechas
          CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX ix_asignaciones_docente_sede_institucion_docente_estado
       ON asignaciones_docente_sede (id_institucion_educativa, id_docente, estado)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_asignaciones_docente_sede_institucion_sede_estado
       ON asignaciones_docente_sede (id_institucion_educativa, id_sede, estado)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_asignaciones_docente_sede_activa
       ON asignaciones_docente_sede (id_docente, id_sede)
       WHERE estado = 'ACTIVA'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_asignaciones_docente_sede_principal_activa
       ON asignaciones_docente_sede (id_docente)
       WHERE es_principal = true AND estado = 'ACTIVA'`,
    );

    // ── docentes_especialidades_profesionales ─────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE docentes_especialidades_profesionales (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        id_docente uuid NOT NULL,
        id_especialidad_profesional uuid NOT NULL,
        es_principal boolean NOT NULL DEFAULT false,
        anios_experiencia smallint,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_docentes_esp_docente_institucion
          FOREIGN KEY (id_docente, id_institucion_educativa)
          REFERENCES docentes (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_docentes_esp_especialidad_institucion
          FOREIGN KEY (id_especialidad_profesional, id_institucion_educativa)
          REFERENCES especialidades_profesionales (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_docentes_esp_estado CHECK (estado IN ('ACTIVA', 'INACTIVA')),
        CONSTRAINT ck_docentes_esp_anios
          CHECK (anios_experiencia IS NULL OR anios_experiencia >= 0)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX ix_docentes_esp_institucion_docente
       ON docentes_especialidades_profesionales (id_institucion_educativa, id_docente)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_docentes_esp_activa
       ON docentes_especialidades_profesionales (id_docente, id_especialidad_profesional)
       WHERE estado = 'ACTIVA'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_docentes_esp_principal_activa
       ON docentes_especialidades_profesionales (id_docente)
       WHERE es_principal = true AND estado = 'ACTIVA'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS docentes_especialidades_profesionales`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS asignaciones_docente_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS docentes`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS especialidades_profesionales`,
    );
  }
}
