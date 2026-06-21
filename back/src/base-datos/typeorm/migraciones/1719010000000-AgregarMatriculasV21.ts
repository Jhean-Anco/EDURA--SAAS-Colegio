import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarMatriculasV211719010000000 implements MigrationInterface {
  name = 'AgregarMatriculasV211719010000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tabla matriculas
    await queryRunner.query(`
      CREATE TABLE matriculas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL,
        id_sede uuid NOT NULL,
        id_estudiante uuid NOT NULL,
        id_anio_academico uuid NOT NULL,
        id_nivel_educativo uuid NOT NULL,
        id_grado_educativo uuid NOT NULL,
        id_oferta_grado_sede uuid NOT NULL,
        id_seccion_academica uuid NULL,
        codigo_matricula varchar(40) NOT NULL,
        fecha_matricula date NOT NULL,
        estado varchar(20) NOT NULL DEFAULT 'BORRADOR',
        observacion text NULL,
        id_usuario_creador uuid NOT NULL,
        id_usuario_activador uuid NULL,
        fecha_activacion timestamptz NULL,
        id_usuario_retiro uuid NULL,
        fecha_retiro timestamptz NULL,
        motivo_retiro text NULL,
        id_usuario_anulacion uuid NULL,
        fecha_anulacion timestamptz NULL,
        motivo_anulacion text NULL,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_matriculas_instituciones_educativas FOREIGN KEY (id_institucion_educativa) REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_estudiantes FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_anios_academicos FOREIGN KEY (id_anio_academico) REFERENCES anios_academicos(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_niveles_educativos FOREIGN KEY (id_nivel_educativo) REFERENCES niveles_educativos(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_grados_educativos FOREIGN KEY (id_grado_educativo) REFERENCES grados_educativos(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_ofertas_grado_sede FOREIGN KEY (id_oferta_grado_sede) REFERENCES ofertas_grado_sede(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_secciones_academicas FOREIGN KEY (id_seccion_academica) REFERENCES secciones_academicas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_usuario_creador FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_usuario_activador FOREIGN KEY (id_usuario_activador) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_usuario_retiro FOREIGN KEY (id_usuario_retiro) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_matriculas_usuario_anulacion FOREIGN KEY (id_usuario_anulacion) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_matriculas_codigo_no_vacio CHECK (trim(codigo_matricula) <> ''),
        CONSTRAINT ck_matriculas_estado CHECK (estado IN ('BORRADOR', 'ACTIVA', 'RETIRADA', 'ANULADA')),
        CONSTRAINT ck_matriculas_activacion_coherente CHECK (
          (estado = 'BORRADOR' AND id_usuario_activador IS NULL AND fecha_activacion IS NULL) OR
          (estado IN ('ACTIVA', 'RETIRADA') AND id_usuario_activador IS NOT NULL AND fecha_activacion IS NOT NULL) OR
          (estado = 'ANULADA')
        ),
        CONSTRAINT ck_matriculas_retiro_coherente CHECK (
          (estado <> 'RETIRADA' AND id_usuario_retiro IS NULL AND fecha_retiro IS NULL AND motivo_retiro IS NULL) OR
          (estado = 'RETIRADA' AND id_usuario_retiro IS NOT NULL AND fecha_retiro IS NOT NULL AND motivo_retiro IS NOT NULL AND trim(motivo_retiro) <> '')
        ),
        CONSTRAINT ck_matriculas_anulacion_coherente CHECK (
          (estado <> 'ANULADA' AND id_usuario_anulacion IS NULL AND fecha_anulacion IS NULL AND motivo_anulacion IS NULL) OR
          (estado = 'ANULADA' AND id_usuario_anulacion IS NOT NULL AND fecha_anulacion IS NOT NULL AND motivo_anulacion IS NOT NULL AND trim(motivo_anulacion) <> '')
        )
      )
    `);

    // 2. Índices para matriculas
    await queryRunner.query(`
      CREATE UNIQUE INDEX ux_matriculas_estudiante_anio_activo 
      ON matriculas (id_institucion_educativa, id_estudiante, id_anio_academico) 
      WHERE estado = 'ACTIVA'
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX ux_matriculas_institucion_codigo 
      ON matriculas (id_institucion_educativa, codigo_matricula)
    `);

    await queryRunner.query(`
      CREATE INDEX ix_matriculas_busqueda 
      ON matriculas (id_institucion_educativa, id_sede, id_anio_academico, estado)
    `);

    // 3. Tabla historial_estados_matricula
    await queryRunner.query(`
      CREATE TABLE historial_estados_matricula (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL,
        id_matricula uuid NOT NULL,
        estado_anterior varchar(20) NULL,
        estado_nuevo varchar(20) NOT NULL,
        motivo text NULL,
        id_usuario uuid NOT NULL,
        correlacion_id varchar(100) NULL,
        fecha timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_historial_estados_instituciones FOREIGN KEY (id_institucion_educativa) REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_historial_estados_matriculas FOREIGN KEY (id_matricula) REFERENCES matriculas(id) ON DELETE CASCADE,
        CONSTRAINT fk_historial_estados_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_historial_estados_nuevo CHECK (estado_nuevo IN ('BORRADOR', 'ACTIVA', 'RETIRADA', 'ANULADA')),
        CONSTRAINT ck_historial_estados_anterior CHECK (estado_anterior IS NULL OR estado_anterior IN ('BORRADOR', 'ACTIVA', 'RETIRADA', 'ANULADA'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX ix_historial_estados_matricula_matricula 
      ON historial_estados_matricula (id_matricula)
    `);

    // 4. Tabla historial_cambios_seccion_matricula
    await queryRunner.query(`
      CREATE TABLE historial_cambios_seccion_matricula (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL,
        id_matricula uuid NOT NULL,
        id_seccion_anterior uuid NULL,
        id_seccion_nueva uuid NOT NULL,
        motivo text NULL,
        id_usuario uuid NOT NULL,
        correlacion_id varchar(100) NULL,
        fecha timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_historial_secciones_instituciones FOREIGN KEY (id_institucion_educativa) REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_historial_secciones_matriculas FOREIGN KEY (id_matricula) REFERENCES matriculas(id) ON DELETE CASCADE,
        CONSTRAINT fk_historial_secciones_anterior FOREIGN KEY (id_seccion_anterior) REFERENCES secciones_academicas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_historial_secciones_nueva FOREIGN KEY (id_seccion_nueva) REFERENCES secciones_academicas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_historial_secciones_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX ix_historial_secciones_matricula_matricula 
      ON historial_cambios_seccion_matricula (id_matricula)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS historial_cambios_seccion_matricula`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS historial_estados_matricula`);
    await queryRunner.query(`DROP TABLE IF EXISTS matriculas`);
  }
}
