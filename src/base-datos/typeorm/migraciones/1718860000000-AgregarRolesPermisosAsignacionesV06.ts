import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarRolesPermisosAsignacionesV061718860000000 implements MigrationInterface {
  name = 'AgregarRolesPermisosAsignacionesV061718860000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      codigo varchar(80) NOT NULL UNIQUE,
      nombre varchar(120) NOT NULL,
      descripcion varchar(400),
      ambito varchar(20) NOT NULL,
      es_sistema boolean NOT NULL DEFAULT true,
      activo boolean NOT NULL DEFAULT true,
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE permisos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      codigo varchar(120) NOT NULL UNIQUE,
      recurso varchar(80) NOT NULL,
      accion varchar(50) NOT NULL,
      descripcion varchar(400),
      activo boolean NOT NULL DEFAULT true,
      fecha_creacion timestamptz NOT NULL DEFAULT now(),
      fecha_modificacion timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT ux_permisos_recurso_accion UNIQUE (recurso, accion)
    )`);
    await queryRunner.query(`CREATE TABLE roles_permisos (
      id_rol uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE ON UPDATE RESTRICT,
      id_permiso uuid NOT NULL REFERENCES permisos(id) ON DELETE CASCADE ON UPDATE RESTRICT,
      fecha_asignacion timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT pk_roles_permisos PRIMARY KEY (id_rol, id_permiso)
    )`);
    await queryRunner.query(`CREATE TABLE asignaciones_rol_usuario (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      id_usuario uuid NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_rol uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      id_membresia_institucion uuid,
      id_sede uuid,
      estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
      fecha_inicio timestamptz NOT NULL DEFAULT now(),
      fecha_fin timestamptz,
      fecha_creacion timestamptz NOT NULL DEFAULT now()
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS asignaciones_rol_usuario`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles_permisos`);
    await queryRunner.query(`DROP TABLE IF EXISTS permisos`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
  }
}
