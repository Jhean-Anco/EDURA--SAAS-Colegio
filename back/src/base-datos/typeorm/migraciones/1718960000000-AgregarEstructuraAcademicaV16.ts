import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarEstructuraAcademicaV161718960000000 implements MigrationInterface {
  name = 'AgregarEstructuraAcademicaV161718960000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── niveles_educativos ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE niveles_educativos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        codigo varchar(30) NOT NULL,
        codigo_normalizado varchar(30) NOT NULL,
        nombre varchar(100) NOT NULL,
        descripcion text,
        orden smallint NOT NULL DEFAULT 0,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVO',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_niveles_id_institucion UNIQUE (id, id_institucion_educativa),
        CONSTRAINT uq_niveles_institucion_codigo UNIQUE (id_institucion_educativa, codigo_normalizado),
        CONSTRAINT uq_niveles_institucion_orden UNIQUE (id_institucion_educativa, orden),
        CONSTRAINT ck_niveles_estado CHECK (estado IN ('ACTIVO', 'INACTIVO')),
        CONSTRAINT ck_niveles_codigo_no_vacio CHECK (trim(codigo) <> ''),
        CONSTRAINT ck_niveles_nombre_no_vacio CHECK (trim(nombre) <> '')
      )
    `);
    await queryRunner.query(
      `CREATE INDEX ix_niveles_educativos_institucion_estado
       ON niveles_educativos (id_institucion_educativa, estado)`,
    );

    // ── grados_educativos ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE grados_educativos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        id_nivel_educativo uuid NOT NULL,
        codigo varchar(30) NOT NULL,
        codigo_normalizado varchar(30) NOT NULL,
        nombre varchar(100) NOT NULL,
        descripcion text,
        orden smallint NOT NULL DEFAULT 0,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVO',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_grados_id_institucion UNIQUE (id, id_institucion_educativa),
        CONSTRAINT fk_grados_nivel_institucion
          FOREIGN KEY (id_nivel_educativo, id_institucion_educativa)
          REFERENCES niveles_educativos (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT uq_grados_nivel_codigo
          UNIQUE (id_nivel_educativo, codigo_normalizado),
        CONSTRAINT uq_grados_nivel_orden
          UNIQUE (id_nivel_educativo, orden),
        CONSTRAINT ck_grados_estado CHECK (estado IN ('ACTIVO', 'INACTIVO')),
        CONSTRAINT ck_grados_codigo_no_vacio CHECK (trim(codigo) <> ''),
        CONSTRAINT ck_grados_nombre_no_vacio CHECK (trim(nombre) <> '')
      )
    `);
    await queryRunner.query(
      `CREATE INDEX ix_grados_educativos_nivel_estado
       ON grados_educativos (id_institucion_educativa, id_nivel_educativo, estado)`,
    );

    // ── anios_academicos ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE anios_academicos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        anio smallint NOT NULL,
        codigo varchar(30) NOT NULL,
        codigo_normalizado varchar(30) NOT NULL,
        nombre varchar(100) NOT NULL,
        fecha_inicio date NOT NULL,
        fecha_fin date NOT NULL,
        estado varchar(20) NOT NULL DEFAULT 'PLANIFICADO',
        observacion text,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_anios_id_institucion UNIQUE (id, id_institucion_educativa),
        CONSTRAINT uq_anios_institucion_anio UNIQUE (id_institucion_educativa, anio),
        CONSTRAINT uq_anios_institucion_codigo UNIQUE (id_institucion_educativa, codigo_normalizado),
        CONSTRAINT ck_anios_estado
          CHECK (estado IN ('PLANIFICADO', 'ACTIVO', 'CERRADO', 'ANULADO')),
        CONSTRAINT ck_anios_fechas CHECK (fecha_fin > fecha_inicio),
        CONSTRAINT ck_anios_nombre_no_vacio CHECK (trim(nombre) <> ''),
        CONSTRAINT ck_anios_codigo_no_vacio CHECK (trim(codigo) <> '')
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_anios_academicos_activo
       ON anios_academicos (id_institucion_educativa)
       WHERE estado = 'ACTIVO'`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_anios_academicos_institucion_estado
       ON anios_academicos (id_institucion_educativa, estado)`,
    );

    // ── periodos_academicos ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE periodos_academicos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        id_anio_academico uuid NOT NULL,
        codigo varchar(30) NOT NULL,
        codigo_normalizado varchar(30) NOT NULL,
        nombre varchar(100) NOT NULL,
        tipo varchar(30) NOT NULL DEFAULT 'BIMESTRE',
        orden smallint NOT NULL DEFAULT 0,
        fecha_inicio date NOT NULL,
        fecha_fin date NOT NULL,
        estado varchar(20) NOT NULL DEFAULT 'PLANIFICADO',
        observacion text,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_periodos_id_institucion UNIQUE (id, id_institucion_educativa),
        CONSTRAINT uq_periodos_anio_codigo
          UNIQUE (id_anio_academico, codigo_normalizado),
        CONSTRAINT uq_periodos_anio_orden
          UNIQUE (id_anio_academico, orden),
        CONSTRAINT fk_periodos_anio_institucion
          FOREIGN KEY (id_anio_academico, id_institucion_educativa)
          REFERENCES anios_academicos (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_periodos_estado
          CHECK (estado IN ('PLANIFICADO', 'ACTIVO', 'CERRADO', 'ANULADO')),
        CONSTRAINT ck_periodos_tipo
          CHECK (tipo IN ('BIMESTRE', 'TRIMESTRE', 'SEMESTRE', 'CUATRIMESTRE', 'OTRO')),
        CONSTRAINT ck_periodos_fechas CHECK (fecha_fin > fecha_inicio),
        CONSTRAINT ck_periodos_codigo_no_vacio CHECK (trim(codigo) <> '')
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_periodos_academicos_activo
       ON periodos_academicos (id_anio_academico)
       WHERE estado = 'ACTIVO'`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_periodos_academicos_anio_estado
       ON periodos_academicos (id_institucion_educativa, id_anio_academico, estado)`,
    );

    // ── ofertas_grado_sede ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE ofertas_grado_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        id_sede uuid NOT NULL,
        id_grado_educativo uuid NOT NULL,
        id_anio_academico uuid NOT NULL,
        capacidad_referencial smallint,
        estado varchar(20) NOT NULL DEFAULT 'PLANIFICADA',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_ofertas_id_institucion UNIQUE (id, id_institucion_educativa),
        CONSTRAINT uq_ofertas_sede_grado_anio
          UNIQUE (id_institucion_educativa, id_sede, id_grado_educativo, id_anio_academico),
        CONSTRAINT fk_ofertas_sede_institucion
          FOREIGN KEY (id_sede, id_institucion_educativa)
          REFERENCES sedes (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_ofertas_grado_institucion
          FOREIGN KEY (id_grado_educativo, id_institucion_educativa)
          REFERENCES grados_educativos (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_ofertas_anio_institucion
          FOREIGN KEY (id_anio_academico, id_institucion_educativa)
          REFERENCES anios_academicos (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_ofertas_estado CHECK (estado IN ('PLANIFICADA', 'ACTIVA', 'CERRADA', 'CANCELADA')),
        CONSTRAINT ck_ofertas_capacidad CHECK (
          capacidad_referencial IS NULL OR capacidad_referencial > 0
        )
      )
    `);
    await queryRunner.query(
      `CREATE INDEX ix_ofertas_grado_sede_sede_anio
       ON ofertas_grado_sede (id_institucion_educativa, id_sede, id_anio_academico, estado)`,
    );

    // ── secciones_academicas ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE secciones_academicas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL
          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        id_oferta_grado_sede uuid NOT NULL,
        id_docente_tutor uuid,
        id_espacio_fisico uuid,
        codigo varchar(30) NOT NULL,
        codigo_normalizado varchar(30) NOT NULL,
        nombre varchar(50) NOT NULL,
        turno varchar(30) NOT NULL,
        capacidad_maxima smallint,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
        observacion text,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_secciones_id_institucion UNIQUE (id, id_institucion_educativa),
        CONSTRAINT uq_secciones_oferta_codigo
          UNIQUE (id_institucion_educativa, id_oferta_grado_sede, codigo_normalizado),
        CONSTRAINT fk_secciones_oferta_institucion
          FOREIGN KEY (id_oferta_grado_sede, id_institucion_educativa)
          REFERENCES ofertas_grado_sede (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_secciones_docente_institucion
          FOREIGN KEY (id_docente_tutor, id_institucion_educativa)
          REFERENCES docentes (id, id_institucion_educativa)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_secciones_espacio_fisico
          FOREIGN KEY (id_espacio_fisico)
          REFERENCES elementos_infraestructura (id)
          ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_secciones_estado CHECK (estado IN ('ACTIVA', 'INACTIVA')),
        CONSTRAINT ck_secciones_nombre_no_vacio CHECK (trim(nombre) <> ''),
        CONSTRAINT ck_secciones_codigo_no_vacio CHECK (trim(codigo) <> ''),
        CONSTRAINT ck_secciones_turno CHECK (turno IN ('MANANA', 'TARDE', 'NOCHE')),
        CONSTRAINT ck_secciones_capacidad CHECK (
          capacidad_maxima IS NULL OR capacidad_maxima > 0
        )
      )
    `);
    await queryRunner.query(
      `CREATE INDEX ix_secciones_oferta_estado
       ON secciones_academicas (id_institucion_educativa, id_oferta_grado_sede, estado)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS secciones_academicas`);
    await queryRunner.query(`DROP TABLE IF EXISTS ofertas_grado_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS periodos_academicos`);
    await queryRunner.query(`DROP TABLE IF EXISTS anios_academicos`);
    await queryRunner.query(`DROP TABLE IF EXISTS grados_educativos`);
    await queryRunner.query(`DROP TABLE IF EXISTS niveles_educativos`);
  }
}
