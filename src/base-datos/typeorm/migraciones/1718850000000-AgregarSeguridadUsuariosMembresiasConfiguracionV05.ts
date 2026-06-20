import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarSeguridadUsuariosMembresiasConfiguracionV051718850000000 implements MigrationInterface {
  name = 'AgregarSeguridadUsuariosMembresiasConfiguracionV051718850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE usuarios (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      correo varchar(320) NOT NULL,
      correo_normalizado varchar(320) NOT NULL UNIQUE,
      nombre_mostrado varchar(150) NOT NULL,
      estado varchar(20) NOT NULL DEFAULT 'PENDIENTE',
      correo_verificado boolean NOT NULL DEFAULT false,
      fecha_verificacion timestamptz,
      ultimo_acceso timestamptz,
      version_seguridad integer NOT NULL DEFAULT 1,
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE credenciales_usuario (
      id_usuario uuid PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE RESTRICT,
      hash_clave varchar(255) NOT NULL,
      algoritmo varchar(30) NOT NULL DEFAULT 'ARGON2ID',
      requiere_cambio boolean NOT NULL DEFAULT false,
      intentos_fallidos smallint NOT NULL DEFAULT 0,
      bloqueado_hasta timestamptz,
      fecha_cambio_clave timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE membresias_institucion (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_usuario uuid NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_institucion_educativa uuid NOT NULL REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      estado varchar(20) NOT NULL DEFAULT 'PENDIENTE',
      fecha_inicio timestamptz,
      fecha_fin timestamptz,
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT ux_membresias_institucion_usuario_institucion UNIQUE (id_usuario, id_institucion_educativa)
    )`);
    await queryRunner.query(`CREATE TABLE configuraciones_institucion (
      id_institucion_educativa uuid PRIMARY KEY REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      zona_horaria varchar(60) NOT NULL DEFAULT 'America/Lima',
      idioma varchar(10) NOT NULL DEFAULT 'es-PE',
      formato_fecha varchar(30) NOT NULL DEFAULT 'DD/MM/YYYY',
      moneda varchar(3) NOT NULL DEFAULT 'PEN',
      nombre_ciclo_actual varchar(100),
      configuracion jsonb NOT NULL DEFAULT '{}'::jsonb,
      version integer NOT NULL DEFAULT 1,
      fecha_modificacion timestamptz NOT NULL DEFAULT now()
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS configuraciones_institucion`);
    await queryRunner.query(`DROP TABLE IF EXISTS membresias_institucion`);
    await queryRunner.query(`DROP TABLE IF EXISTS credenciales_usuario`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);
  }
}
