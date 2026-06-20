import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarEstudiantesApoderadosDocumentosV131718930000000 implements MigrationInterface {
  name = 'AgregarEstudiantesApoderadosDocumentosV131718930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE estudiantes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_sede uuid NOT NULL,
      id_persona uuid NOT NULL REFERENCES personas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      codigo varchar(40) NOT NULL,
      estado varchar(30) NOT NULL DEFAULT 'ACTIVO',
      fecha_ingreso date,
      fecha_retiro date,
      observacion text,
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT fk_estudiantes_sede_institucion FOREIGN KEY (id_sede, id_institucion_educativa)
        REFERENCES sedes(id, id_institucion_educativa) ON DELETE RESTRICT ON UPDATE RESTRICT
    )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_estudiantes_institucion_codigo ON estudiantes (id_institucion_educativa, codigo)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_estudiantes_institucion_persona ON estudiantes (id_institucion_educativa, id_persona)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_estudiantes_institucion_sede_estado ON estudiantes (id_institucion_educativa, id_sede, estado)`,
    );

    await queryRunner.query(`CREATE TABLE apoderados_estudiante (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_estudiante uuid NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_persona uuid NOT NULL REFERENCES personas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      parentesco varchar(40) NOT NULL,
      es_principal boolean NOT NULL DEFAULT false,
      puede_recoger boolean NOT NULL DEFAULT false,
      recibe_comunicaciones boolean NOT NULL DEFAULT true,
      estado varchar(30) NOT NULL DEFAULT 'ACTIVO',
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_apoderados_estudiante_estudiante_persona ON apoderados_estudiante (id_estudiante, id_persona)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_apoderados_estudiante_institucion_estudiante_estado ON apoderados_estudiante (id_institucion_educativa, id_estudiante, estado)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_apoderado_principal_activo_estudiante ON apoderados_estudiante (id_estudiante) WHERE es_principal AND estado = 'ACTIVO'`,
    );

    await queryRunner.query(`CREATE TABLE documentos_estudiante (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_estudiante uuid NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      tipo_documento varchar(60) NOT NULL,
      nombre varchar(160) NOT NULL,
      estado varchar(30) NOT NULL DEFAULT 'PENDIENTE',
      fecha_emision date,
      fecha_vencimiento date,
      observacion text,
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(
      `CREATE INDEX ix_documentos_estudiante_institucion_estudiante ON documentos_estudiante (id_institucion_educativa, id_estudiante)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS documentos_estudiante`);
    await queryRunner.query(`DROP TABLE IF EXISTS apoderados_estudiante`);
    await queryRunner.query(`DROP TABLE IF EXISTS estudiantes`);
  }
}
