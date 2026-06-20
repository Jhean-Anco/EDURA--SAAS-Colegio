import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearPersonasV101718900000000 implements MigrationInterface {
  name = 'CrearPersonasV101718900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS personas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL,
        nombres varchar(150) NOT NULL,
        apellido_paterno varchar(100) NULL,
        apellido_materno varchar(100) NULL,
        fecha_nacimiento date NULL,
        sexo_registral varchar(30) NULL,
        codigo_pais_nacionalidad char(2) NULL,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      ALTER TABLE personas
      ADD CONSTRAINT fk_personas_institucion
      FOREIGN KEY (id_institucion_educativa) REFERENCES instituciones_educativas(id)
      ON UPDATE CASCADE ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_personas_institucion_estado
      ON personas (id_institucion_educativa, estado)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_personas_institucion_nombres
      ON personas (id_institucion_educativa, nombres)
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tipos_documento_identidad (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo varchar(40) NOT NULL UNIQUE,
        nombre varchar(100) NOT NULL,
        longitud_minima smallint NULL,
        longitud_maxima smallint NULL,
        patron varchar(200) NULL,
        activo boolean NOT NULL DEFAULT true,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS documentos_identidad_persona (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL,
        id_persona uuid NOT NULL,
        id_tipo_documento uuid NOT NULL,
        numero varchar(80) NOT NULL,
        numero_normalizado varchar(80) NOT NULL,
        codigo_pais_emision char(2) NULL,
        es_principal boolean NOT NULL DEFAULT false,
        fecha_emision date NULL,
        fecha_vencimiento date NULL,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVO',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      ALTER TABLE documentos_identidad_persona
      ADD CONSTRAINT fk_documentos_persona
      FOREIGN KEY (id_persona) REFERENCES personas(id)
      ON UPDATE CASCADE ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE documentos_identidad_persona
      ADD CONSTRAINT fk_documentos_tipo
      FOREIGN KEY (id_tipo_documento) REFERENCES tipos_documento_identidad(id)
      ON UPDATE CASCADE ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_documentos_identidad_persona_unico
      ON documentos_identidad_persona (id_institucion_educativa, id_tipo_documento, numero_normalizado)
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS medios_contacto_persona (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL,
        id_persona uuid NOT NULL,
        tipo varchar(30) NOT NULL,
        valor varchar(320) NOT NULL,
        valor_normalizado varchar(320) NOT NULL,
        es_principal boolean NOT NULL DEFAULT false,
        verificado boolean NOT NULL DEFAULT false,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVO',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS direcciones_persona (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL,
        id_persona uuid NOT NULL,
        id_ubigeo uuid NULL,
        direccion_linea varchar(250) NOT NULL,
        referencia varchar(250) NULL,
        latitud numeric(9,6) NULL,
        longitud numeric(9,6) NULL,
        es_principal boolean NOT NULL DEFAULT false,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS direcciones_persona`);
    await queryRunner.query(`DROP TABLE IF EXISTS medios_contacto_persona`);
    await queryRunner.query(`
      DROP TABLE IF EXISTS documentos_identidad_persona
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS tipos_documento_identidad`);
    await queryRunner.query(`DROP TABLE IF EXISTS personas`);
  }
}
