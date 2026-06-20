import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarPanelInstitucionalV121718920000000 implements MigrationInterface {
  name = 'AgregarPanelInstitucionalV121718920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE alertas_institucionales (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_sede uuid,
      tipo varchar(40) NOT NULL,
      titulo varchar(160) NOT NULL,
      descripcion text,
      prioridad varchar(20) NOT NULL,
      estado varchar(20) NOT NULL,
      modulo_origen varchar(80) NOT NULL,
      id_recurso_origen varchar(100),
      fecha_generacion timestamptz NOT NULL DEFAULT now(),
      fecha_resolucion timestamptz,
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT ck_alertas_institucionales_prioridad CHECK (prioridad IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA')),
      CONSTRAINT ck_alertas_institucionales_estado CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'RESUELTA', 'DESCARTADA')),
      CONSTRAINT fk_alertas_institucionales_sede_institucion FOREIGN KEY (id_sede, id_institucion_educativa)
        REFERENCES sedes(id, id_institucion_educativa) ON DELETE RESTRICT ON UPDATE RESTRICT
    )`);
    await queryRunner.query(
      `CREATE INDEX ix_alertas_institucionales_institucion_estado_prioridad ON alertas_institucionales (id_institucion_educativa, estado, prioridad)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_alertas_institucionales_institucion_sede_estado ON alertas_institucionales (id_institucion_educativa, id_sede, estado)`,
    );

    await queryRunner.query(`CREATE TABLE comunicados_institucionales (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_sede uuid,
      titulo varchar(160) NOT NULL,
      contenido text NOT NULL,
      tipo varchar(40) NOT NULL,
      prioridad varchar(20) NOT NULL,
      estado varchar(20) NOT NULL,
      fecha_publicacion timestamptz,
      id_usuario_creador uuid,
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT ck_comunicados_institucionales_prioridad CHECK (prioridad IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA')),
      CONSTRAINT ck_comunicados_institucionales_estado CHECK (estado IN ('BORRADOR', 'PUBLICADO', 'ARCHIVADO')),
      CONSTRAINT fk_comunicados_institucionales_sede_institucion FOREIGN KEY (id_sede, id_institucion_educativa)
        REFERENCES sedes(id, id_institucion_educativa) ON DELETE RESTRICT ON UPDATE RESTRICT,
      CONSTRAINT fk_comunicados_institucionales_usuario_creador FOREIGN KEY (id_usuario_creador)
        REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE RESTRICT
    )`);
    await queryRunner.query(
      `CREATE INDEX ix_comunicados_institucionales_institucion_estado_publicacion ON comunicados_institucionales (id_institucion_educativa, estado, fecha_publicacion DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS comunicados_institucionales`);
    await queryRunner.query(`DROP TABLE IF EXISTS alertas_institucionales`);
  }
}
