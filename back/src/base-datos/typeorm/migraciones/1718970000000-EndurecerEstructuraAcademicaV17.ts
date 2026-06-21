import { MigrationInterface, QueryRunner } from 'typeorm';

export class EndurecerEstructuraAcademicaV171718970000000 implements MigrationInterface {
  name = 'EndurecerEstructuraAcademicaV171718970000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Habilitar btree_gist
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS btree_gist');

    // 2. Restricciones CHECK de orden y año
    await queryRunner.query(
      `ALTER TABLE anios_academicos ADD CONSTRAINT ck_anios_anio_rango CHECK (anio BETWEEN 2000 AND 2100)`,
    );
    await queryRunner.query(
      `ALTER TABLE niveles_educativos ADD CONSTRAINT ck_niveles_orden_pos CHECK (orden > 0)`,
    );
    await queryRunner.query(
      `ALTER TABLE grados_educativos ADD CONSTRAINT ck_grados_orden_pos CHECK (orden > 0)`,
    );
    await queryRunner.query(
      `ALTER TABLE periodos_academicos ADD CONSTRAINT ck_periodos_orden_pos CHECK (orden > 0)`,
    );

    // 3. Exclusión para evitar solapamientos de periodos
    await queryRunner.query(`
      ALTER TABLE periodos_academicos ADD CONSTRAINT ex_periodos_solapamiento
      EXCLUDE USING gist (
        id_anio_academico WITH =,
        daterange(fecha_inicio, fecha_fin, '[]') WITH &&
      )
      WHERE (estado <> 'ANULADO')
    `);

    // 4. Modificar estados y turnos de secciones académicas
    await queryRunner.query(
      `ALTER TABLE secciones_academicas DROP CONSTRAINT IF EXISTS ck_secciones_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE secciones_academicas ADD CONSTRAINT ck_secciones_estado CHECK (estado IN ('PLANIFICADA', 'ACTIVA', 'CERRADA', 'INACTIVA'))`,
    );

    await queryRunner.query(
      `ALTER TABLE secciones_academicas DROP CONSTRAINT IF EXISTS ck_secciones_turno`,
    );
    await queryRunner.query(
      `ALTER TABLE secciones_academicas ADD CONSTRAINT ck_secciones_turno CHECK (turno IN ('MANANA', 'TARDE', 'NOCHE', 'COMPLETO', 'OTRO'))`,
    );

    // 5. Conversión segura de capacidad_maxima a NOT NULL
    await queryRunner.query(`
      DO $$
      DECLARE
        nulos_sin_referencia integer;
      BEGIN
        SELECT COUNT(*) INTO nulos_sin_referencia
        FROM secciones_academicas s
        LEFT JOIN ofertas_grado_sede o ON s.id_oferta_grado_sede = o.id
        WHERE s.capacidad_maxima IS NULL AND (o.capacidad_referencial IS NULL OR o.capacidad_referencial <= 0);

        IF nulos_sin_referencia > 0 THEN
          RAISE EXCEPTION 'No se puede convertir capacidad_maxima a NOT NULL porque existen % secciones sin capacidad referencial válida en su oferta.', nulos_sin_referencia;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      UPDATE secciones_academicas s
      SET capacidad_maxima = o.capacidad_referencial
      FROM ofertas_grado_sede o
      WHERE s.id_oferta_grado_sede = o.id AND s.capacidad_maxima IS NULL
    `);

    await queryRunner.query(
      `ALTER TABLE secciones_academicas ALTER COLUMN capacidad_maxima SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE secciones_academicas ADD CONSTRAINT ck_secciones_capacidad_maxima_pos CHECK (capacidad_maxima > 0)`,
    );

    // 6. Índices adicionales
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS ix_secciones_espacio_estado ON secciones_academicas (id_espacio_fisico, estado)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS ix_secciones_tutor_estado ON secciones_academicas (id_docente_tutor, estado)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS ix_secciones_tutor_estado`);
    await queryRunner.query(`DROP INDEX IF EXISTS ix_secciones_espacio_estado`);

    // 2. Deshacer check de capacidad y NOT NULL
    await queryRunner.query(
      `ALTER TABLE secciones_academicas DROP CONSTRAINT IF EXISTS ck_secciones_capacidad_maxima_pos`,
    );
    await queryRunner.query(
      `ALTER TABLE secciones_academicas ALTER COLUMN capacidad_maxima DROP NOT NULL`,
    );

    // 3. Restaurar estados y turnos anteriores (previos a V17)
    await queryRunner.query(
      `ALTER TABLE secciones_academicas DROP CONSTRAINT IF EXISTS ck_secciones_turno`,
    );
    await queryRunner.query(
      `ALTER TABLE secciones_academicas ADD CONSTRAINT ck_secciones_turno CHECK (turno IN ('MANANA', 'TARDE', 'NOCHE'))`,
    );
    await queryRunner.query(
      `ALTER TABLE secciones_academicas DROP CONSTRAINT IF EXISTS ck_secciones_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE secciones_academicas ADD CONSTRAINT ck_secciones_estado CHECK (estado IN ('ACTIVA', 'INACTIVA'))`,
    );

    // 4. Remover exclusión de solapamiento
    await queryRunner.query(
      `ALTER TABLE periodos_academicos DROP CONSTRAINT IF EXISTS ex_periodos_solapamiento`,
    );

    // 5. Remover checks de orden y año
    await queryRunner.query(
      `ALTER TABLE periodos_academicos DROP CONSTRAINT IF EXISTS ck_periodos_orden_pos`,
    );
    await queryRunner.query(
      `ALTER TABLE grados_educativos DROP CONSTRAINT IF EXISTS ck_grados_orden_pos`,
    );
    await queryRunner.query(
      `ALTER TABLE niveles_educativos DROP CONSTRAINT IF EXISTS ck_niveles_orden_pos`,
    );
    await queryRunner.query(
      `ALTER TABLE anios_academicos DROP CONSTRAINT IF EXISTS ck_anios_anio_rango`,
    );

    // 6. La extensión btree_gist puede tener otros usuarios; solo se intenta eliminar
    //    si no hay otros objetos dependientes. En ambientes compartidos es seguro ignorar.
    await queryRunner.query(`DROP EXTENSION IF EXISTS btree_gist`);
  }
}
