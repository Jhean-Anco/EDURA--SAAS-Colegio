import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarCurriculoPlanesEstudioV191718990000000
  implements MigrationInterface
{
  name = 'AgregarCurriculoPlanesEstudioV191718990000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // ── ENT-CUR-001: areas_curriculares ───────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE areas_curriculares (
        id                      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid          NOT NULL,
        codigo                  varchar(30)   NOT NULL,
        codigo_normalizado      varchar(30)   NOT NULL,
        nombre                  varchar(150)  NOT NULL,
        nombre_normalizado      varchar(150)  NOT NULL,
        descripcion             text          NULL,
        orden                   smallint      NOT NULL,
        estado                  varchar(20)   NOT NULL DEFAULT 'ACTIVA',
        fecha_creacion          timestamptz   NOT NULL DEFAULT now(),
        fecha_modificacion      timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT ac_pk_id_inst    UNIQUE (id, id_institucion_educativa),
        CONSTRAINT ac_uq_codigo     UNIQUE (id_institucion_educativa, codigo_normalizado),
        CONSTRAINT ac_uq_nombre     UNIQUE (id_institucion_educativa, nombre_normalizado),
        CONSTRAINT ac_uq_orden      UNIQUE (id_institucion_educativa, orden),
        CONSTRAINT ac_chk_orden     CHECK (orden > 0),
        CONSTRAINT ac_chk_codigo    CHECK (trim(codigo) <> ''),
        CONSTRAINT ac_chk_nombre    CHECK (trim(nombre) <> ''),
        CONSTRAINT ac_chk_estado    CHECK (estado IN ('ACTIVA', 'INACTIVA')),
        CONSTRAINT ac_fk_inst       FOREIGN KEY (id_institucion_educativa)
                                      REFERENCES instituciones_educativas(id) ON DELETE RESTRICT
      )
    `);

    // ── ENT-CUR-002: asignaturas ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE asignaturas (
        id                      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid          NOT NULL,
        id_area_curricular      uuid          NOT NULL,
        codigo                  varchar(30)   NOT NULL,
        codigo_normalizado      varchar(30)   NOT NULL,
        nombre                  varchar(150)  NOT NULL,
        nombre_corto            varchar(60)   NULL,
        descripcion             text          NULL,
        orden                   smallint      NOT NULL,
        estado                  varchar(20)   NOT NULL DEFAULT 'ACTIVA',
        fecha_creacion          timestamptz   NOT NULL DEFAULT now(),
        fecha_modificacion      timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT asig_pk_id_inst  UNIQUE (id, id_institucion_educativa),
        CONSTRAINT asig_uq_codigo   UNIQUE (id_institucion_educativa, codigo_normalizado),
        CONSTRAINT asig_uq_orden    UNIQUE (id_area_curricular, orden),
        CONSTRAINT asig_chk_orden   CHECK (orden > 0),
        CONSTRAINT asig_chk_estado  CHECK (estado IN ('ACTIVA', 'INACTIVA')),
        CONSTRAINT asig_fk_inst     FOREIGN KEY (id_institucion_educativa)
                                      REFERENCES instituciones_educativas(id) ON DELETE RESTRICT,
        CONSTRAINT asig_fk_area     FOREIGN KEY (id_area_curricular, id_institucion_educativa)
                                      REFERENCES areas_curriculares(id, id_institucion_educativa) ON DELETE RESTRICT
      )
    `);

    // ── ENT-CUR-003: planes_estudio ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE planes_estudio (
        id                      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid          NOT NULL,
        id_anio_academico       uuid          NOT NULL,
        id_grado_educativo      uuid          NOT NULL,
        codigo                  varchar(40)   NOT NULL,
        codigo_normalizado      varchar(40)   NOT NULL,
        nombre                  varchar(180)  NOT NULL,
        version                 smallint      NOT NULL,
        estado                  varchar(20)   NOT NULL DEFAULT 'BORRADOR',
        observacion             text          NULL,
        fecha_aprobacion        timestamptz   NULL,
        id_usuario_aprobador    uuid          NULL,
        fecha_creacion          timestamptz   NOT NULL DEFAULT now(),
        fecha_modificacion      timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT pe_pk_id_inst    UNIQUE (id, id_institucion_educativa),
        CONSTRAINT pe_uq_codigo     UNIQUE (id_institucion_educativa, codigo_normalizado),
        CONSTRAINT pe_uq_version    UNIQUE (id_institucion_educativa, id_anio_academico, id_grado_educativo, version),
        CONSTRAINT pe_chk_version   CHECK (version > 0),
        CONSTRAINT pe_chk_estado    CHECK (estado IN ('BORRADOR','APROBADO','VIGENTE','CERRADO','ANULADO')),
        CONSTRAINT pe_fk_inst       FOREIGN KEY (id_institucion_educativa)
                                      REFERENCES instituciones_educativas(id) ON DELETE RESTRICT,
        CONSTRAINT pe_fk_anio       FOREIGN KEY (id_anio_academico, id_institucion_educativa)
                                      REFERENCES anios_academicos(id, id_institucion_educativa) ON DELETE RESTRICT,
        CONSTRAINT pe_fk_grado      FOREIGN KEY (id_grado_educativo, id_institucion_educativa)
                                      REFERENCES grados_educativos(id, id_institucion_educativa) ON DELETE RESTRICT
      )
    `);

    // Índice parcial: solo un plan VIGENTE por institución, año y grado
    await queryRunner.query(`
      CREATE UNIQUE INDEX pe_uq_vigente
        ON planes_estudio (id_institucion_educativa, id_anio_academico, id_grado_educativo)
        WHERE estado = 'VIGENTE'
    `);

    // ── ENT-CUR-004: detalles_plan_estudio ────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE detalles_plan_estudio (
        id                      uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid          NOT NULL,
        id_plan_estudio         uuid          NOT NULL,
        id_asignatura           uuid          NOT NULL,
        tipo                    varchar(20)   NOT NULL,
        horas_semanales         smallint      NOT NULL,
        horas_anuales           smallint      NOT NULL,
        orden                   smallint      NOT NULL,
        estado                  varchar(20)   NOT NULL DEFAULT 'ACTIVO',
        observacion             text          NULL,
        fecha_creacion          timestamptz   NOT NULL DEFAULT now(),
        fecha_modificacion      timestamptz   NOT NULL DEFAULT now(),
        CONSTRAINT dpe_chk_tipo         CHECK (tipo IN ('OBLIGATORIA', 'ELECTIVA')),
        CONSTRAINT dpe_chk_estado       CHECK (estado IN ('ACTIVO', 'INACTIVO')),
        CONSTRAINT dpe_chk_horas_sem    CHECK (horas_semanales > 0),
        CONSTRAINT dpe_chk_horas_an     CHECK (horas_anuales > 0),
        CONSTRAINT dpe_chk_orden        CHECK (orden > 0),
        CONSTRAINT dpe_fk_inst          FOREIGN KEY (id_institucion_educativa)
                                          REFERENCES instituciones_educativas(id) ON DELETE RESTRICT,
        CONSTRAINT dpe_fk_plan          FOREIGN KEY (id_plan_estudio, id_institucion_educativa)
                                          REFERENCES planes_estudio(id, id_institucion_educativa) ON DELETE RESTRICT,
        CONSTRAINT dpe_fk_asig          FOREIGN KEY (id_asignatura, id_institucion_educativa)
                                          REFERENCES asignaturas(id, id_institucion_educativa) ON DELETE RESTRICT
      )
    `);

    // Índices únicos parciales: una asignatura activa por plan, un orden activo por plan
    await queryRunner.query(`
      CREATE UNIQUE INDEX dpe_uq_asig_activa
        ON detalles_plan_estudio (id_plan_estudio, id_asignatura)
        WHERE estado = 'ACTIVO'
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX dpe_uq_orden_activo
        ON detalles_plan_estudio (id_plan_estudio, orden)
        WHERE estado = 'ACTIVO'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS detalles_plan_estudio`);
    await queryRunner.query(`DROP TABLE IF EXISTS planes_estudio`);
    await queryRunner.query(`DROP TABLE IF EXISTS asignaturas`);
    await queryRunner.query(`DROP TABLE IF EXISTS areas_curriculares`);
  }
}
