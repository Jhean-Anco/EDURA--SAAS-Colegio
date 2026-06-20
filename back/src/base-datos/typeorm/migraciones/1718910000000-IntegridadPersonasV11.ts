import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntegridadPersonasV111718910000000 implements MigrationInterface {
  name = 'IntegridadPersonasV111718910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE personas
      ADD CONSTRAINT uq_personas_id_institucion
      UNIQUE (id, id_institucion_educativa)
    `);

    await queryRunner.query(`
      ALTER TABLE personas
      ADD CONSTRAINT ck_personas_estado
      CHECK (estado IN ('ACTIVA', 'INACTIVA', 'BAJA'))
    `);
    await queryRunner.query(`
      ALTER TABLE personas
      ADD CONSTRAINT ck_personas_fecha_nacimiento
      CHECK (fecha_nacimiento IS NULL OR fecha_nacimiento <= CURRENT_DATE)
    `);
    await queryRunner.query(`
      ALTER TABLE personas
      ADD CONSTRAINT ck_personas_nombres_no_vacio
      CHECK (trim(nombres) <> '')
    `);

    await queryRunner.query(`
      ALTER TABLE documentos_identidad_persona
      ADD CONSTRAINT ck_documentos_estado
      CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BAJA'))
    `);
    await queryRunner.query(`
      ALTER TABLE documentos_identidad_persona
      ADD CONSTRAINT ck_documentos_vencimiento
      CHECK (
        fecha_vencimiento IS NULL OR
        fecha_emision IS NULL OR
        fecha_vencimiento >= fecha_emision
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_documentos_principal_activo
      ON documentos_identidad_persona (id_persona, id_institucion_educativa)
      WHERE es_principal = true AND estado = 'ACTIVO'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_documentos_persona_institucion
      ON documentos_identidad_persona (id_persona, id_institucion_educativa)
    `);

    await queryRunner.query(`
      ALTER TABLE medios_contacto_persona
      ADD CONSTRAINT ck_medios_contacto_estado
      CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BAJA'))
    `);
    await queryRunner.query(`
      ALTER TABLE medios_contacto_persona
      ADD CONSTRAINT ck_medios_contacto_tipo
      CHECK (tipo IN ('CORREO', 'CELULAR', 'TELEFONO', 'OTRO'))
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_medios_contacto_principal_activo
      ON medios_contacto_persona (id_persona, id_institucion_educativa, tipo)
      WHERE es_principal = true AND estado = 'ACTIVO'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_medios_contacto_persona_institucion
      ON medios_contacto_persona (id_persona, id_institucion_educativa)
    `);

    await queryRunner.query(`
      ALTER TABLE direcciones_persona
      ADD CONSTRAINT ck_direcciones_estado
      CHECK (estado IN ('ACTIVA', 'INACTIVA', 'BAJA'))
    `);
    await queryRunner.query(`
      ALTER TABLE direcciones_persona
      ADD CONSTRAINT ck_direcciones_latitud
      CHECK (latitud IS NULL OR (latitud >= -90 AND latitud <= 90))
    `);
    await queryRunner.query(`
      ALTER TABLE direcciones_persona
      ADD CONSTRAINT ck_direcciones_longitud
      CHECK (longitud IS NULL OR (longitud >= -180 AND longitud <= 180))
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_direcciones_principal_activa
      ON direcciones_persona (id_persona, id_institucion_educativa)
      WHERE es_principal = true AND estado = 'ACTIVA'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_direcciones_persona_institucion
      ON direcciones_persona (id_persona, id_institucion_educativa)
    `);

    await queryRunner.query(`
      ALTER TABLE asignaciones_rol_usuario
      ADD CONSTRAINT ck_asignaciones_fechas
      CHECK (
        fecha_fin IS NULL OR
        fecha_inicio IS NULL OR
        fecha_fin >= fecha_inicio
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE asignaciones_rol_usuario DROP CONSTRAINT IF EXISTS ck_asignaciones_fechas`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS ux_direcciones_principal_activa`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_direcciones_persona_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE direcciones_persona DROP CONSTRAINT IF EXISTS ck_direcciones_longitud`,
    );
    await queryRunner.query(
      `ALTER TABLE direcciones_persona DROP CONSTRAINT IF EXISTS ck_direcciones_latitud`,
    );
    await queryRunner.query(
      `ALTER TABLE direcciones_persona DROP CONSTRAINT IF EXISTS ck_direcciones_estado`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS ux_medios_contacto_principal_activo`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_medios_contacto_persona_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE medios_contacto_persona DROP CONSTRAINT IF EXISTS ck_medios_contacto_tipo`,
    );
    await queryRunner.query(
      `ALTER TABLE medios_contacto_persona DROP CONSTRAINT IF EXISTS ck_medios_contacto_estado`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS ux_documentos_principal_activo`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_documentos_persona_institucion`,
    );
    await queryRunner.query(
      `ALTER TABLE documentos_identidad_persona DROP CONSTRAINT IF EXISTS ck_documentos_vencimiento`,
    );
    await queryRunner.query(
      `ALTER TABLE documentos_identidad_persona DROP CONSTRAINT IF EXISTS ck_documentos_estado`,
    );

    await queryRunner.query(
      `ALTER TABLE personas DROP CONSTRAINT IF EXISTS ck_personas_nombres_no_vacio`,
    );
    await queryRunner.query(
      `ALTER TABLE personas DROP CONSTRAINT IF EXISTS ck_personas_fecha_nacimiento`,
    );
    await queryRunner.query(
      `ALTER TABLE personas DROP CONSTRAINT IF EXISTS ck_personas_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE personas DROP CONSTRAINT IF EXISTS uq_personas_id_institucion`,
    );
  }
}
