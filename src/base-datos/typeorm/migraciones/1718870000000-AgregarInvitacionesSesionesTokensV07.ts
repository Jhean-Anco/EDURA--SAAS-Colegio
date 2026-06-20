import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarInvitacionesSesionesTokensV071718870000000 implements MigrationInterface {
  name = 'AgregarInvitacionesSesionesTokensV071718870000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE invitaciones_acceso (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_sede uuid REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_rol_inicial uuid REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_usuario_invitador uuid NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_usuario_aceptante uuid REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      correo_destino varchar(320) NOT NULL,
      correo_normalizado varchar(320) NOT NULL,
      token_hash varchar(128) NOT NULL UNIQUE,
      estado varchar(20) NOT NULL DEFAULT 'PENDIENTE',
      fecha_expiracion timestamptz NOT NULL,
      fecha_aceptacion timestamptz,
      fecha_revocacion timestamptz,
      fecha_creacion timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE sesiones_usuario (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_usuario uuid NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_sesion_anterior uuid REFERENCES sesiones_usuario(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      token_actualizacion_hash varchar(128) NOT NULL UNIQUE,
      identificador_familia uuid NOT NULL,
      fecha_expiracion timestamptz NOT NULL,
      fecha_revocacion timestamptz,
      motivo_revocacion varchar(100),
      direccion_ip inet,
      agente_usuario varchar(500),
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      ultimo_uso timestamptz
    )`);
    await queryRunner.query(`CREATE TABLE tokens_seguridad_usuario (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_usuario uuid NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      tipo varchar(30) NOT NULL,
      token_hash varchar(128) NOT NULL UNIQUE,
      fecha_expiracion timestamptz NOT NULL,
      fecha_consumo timestamptz,
      fecha_creacion timestamptz NOT NULL DEFAULT now()
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tokens_seguridad_usuario`);
    await queryRunner.query(`DROP TABLE IF EXISTS sesiones_usuario`);
    await queryRunner.query(`DROP TABLE IF EXISTS invitaciones_acceso`);
  }
}
