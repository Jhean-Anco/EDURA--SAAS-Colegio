import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConsolidarBaseInstitucionalInfraestructuraV021718820000000 implements MigrationInterface {
  name = 'ConsolidarBaseInstitucionalInfraestructuraV021718820000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE unidades_medida
      ADD COLUMN IF NOT EXISTS simbolo varchar(20)
    `);
    await queryRunner.query(`
      ALTER TABLE unidades_medida
      ADD COLUMN IF NOT EXISTS magnitud varchar(40)
    `);
    await queryRunner.query(`
      UPDATE unidades_medida
      SET magnitud = COALESCE(magnitud, 'CANTIDAD')
      WHERE magnitud IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE unidades_medida
      ALTER COLUMN magnitud SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE instituciones_educativas
      DROP CONSTRAINT IF EXISTS ck_instituciones_educativas_estado
    `);
    await queryRunner.query(`
      ALTER TABLE instituciones_educativas
      ADD CONSTRAINT ck_instituciones_educativas_estado
      CHECK (estado IN ('ACTIVA', 'INACTIVA', 'BAJA'))
    `);
    await queryRunner.query(`
      ALTER TABLE sedes
      DROP CONSTRAINT IF EXISTS ck_sedes_estado
    `);
    await queryRunner.query(`
      ALTER TABLE sedes
      ADD CONSTRAINT ck_sedes_estado
      CHECK (estado IN ('ACTIVA', 'INACTIVA', 'BAJA'))
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_sedes_principal_activa
      ON sedes (id_institucion_educativa)
      WHERE es_principal AND estado = 'ACTIVA'
    `);
    await queryRunner.query(`
      ALTER TABLE ubigeos
      DROP CONSTRAINT IF EXISTS ck_ubigeos_padre_distinto
    `);
    await queryRunner.query(`
      ALTER TABLE ubigeos
      ADD CONSTRAINT ck_ubigeos_padre_distinto
      CHECK (id_ubigeo_padre IS NULL OR id_ubigeo_padre <> id)
    `);
    await queryRunner.query(`
      ALTER TABLE servicios_basicos_sede
      DROP CONSTRAINT IF EXISTS ck_servicios_basicos_sede_estado
    `);
    await queryRunner.query(`
      ALTER TABLE servicios_basicos_sede
      ADD CONSTRAINT ck_servicios_basicos_sede_estado
      CHECK (estado_servicio IN ('ACTIVO', 'SUSPENDIDO', 'INACTIVO', 'BAJA'))
    `);
    await queryRunner.query(`
      ALTER TABLE estados_conservacion
      DROP CONSTRAINT IF EXISTS ck_estados_conservacion_orden
    `);
    await queryRunner.query(`
      ALTER TABLE estados_conservacion
      ADD CONSTRAINT ck_estados_conservacion_orden
      CHECK (orden >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE elementos_infraestructura
      DROP CONSTRAINT IF EXISTS ck_elementos_infraestructura_estado
    `);
    await queryRunner.query(`
      ALTER TABLE elementos_infraestructura
      ADD CONSTRAINT ck_elementos_infraestructura_estado
      CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BAJA'))
    `);
    await queryRunner.query(`
      ALTER TABLE elementos_infraestructura
      DROP CONSTRAINT IF EXISTS ck_elementos_infraestructura_orden
    `);
    await queryRunner.query(`
      ALTER TABLE elementos_infraestructura
      ADD CONSTRAINT ck_elementos_infraestructura_orden
      CHECK (orden >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE elementos_infraestructura
      DROP CONSTRAINT IF EXISTS ck_elementos_infraestructura_fechas
    `);
    await queryRunner.query(`
      ALTER TABLE elementos_infraestructura
      ADD CONSTRAINT ck_elementos_infraestructura_fechas
      CHECK (fecha_baja IS NULL OR fecha_alta IS NULL OR fecha_baja >= fecha_alta)
    `);
    await queryRunner.query(`
      ALTER TABLE elementos_infraestructura
      DROP CONSTRAINT IF EXISTS ck_elementos_infraestructura_padre_distinto
    `);
    await queryRunner.query(`
      ALTER TABLE elementos_infraestructura
      ADD CONSTRAINT ck_elementos_infraestructura_padre_distinto
      CHECK (id_elemento_padre IS NULL OR id_elemento_padre <> id)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_elementos_infraestructura_sede_codigo
      ON elementos_infraestructura (id_sede, codigo)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_elementos_infraestructura_id_sede
      ON elementos_infraestructura (id, id_sede)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_elementos_infraestructura_padre
      ON elementos_infraestructura (id_elemento_padre)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_elementos_infraestructura_sede_tipo
      ON elementos_infraestructura (id_sede, id_tipo_elemento)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_elementos_infraestructura_sede_estado
      ON elementos_infraestructura (id_sede, estado)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_elementos_infraestructura_estado_conservacion
      ON elementos_infraestructura (id_estado_conservacion)
    `);
    await queryRunner.query(`
      ALTER TABLE predios
      DROP CONSTRAINT IF EXISTS fk_predios_tipos_tenencia
    `);
    await queryRunner.query(`
      ALTER TABLE predios
      ADD CONSTRAINT fk_predios_tipos_tenencia_predio
      FOREIGN KEY (id_tipo_tenencia)
      REFERENCES tipos_tenencia_predio(id)
      ON DELETE RESTRICT ON UPDATE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE predios
      DROP CONSTRAINT IF EXISTS ck_predios_area_total
    `);
    await queryRunner.query(`
      ALTER TABLE predios
      ADD CONSTRAINT ck_predios_area_total
      CHECK (area_total_m2 IS NULL OR area_total_m2 >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE edificaciones
      DROP CONSTRAINT IF EXISTS ck_edificaciones_areas
    `);
    await queryRunner.query(`
      ALTER TABLE edificaciones
      ADD CONSTRAINT ck_edificaciones_areas
      CHECK (
        (area_techada_m2 IS NULL OR area_techada_m2 >= 0)
        AND (area_construida_m2 IS NULL OR area_construida_m2 >= 0)
      )
    `);
    await queryRunner.query(`
      ALTER TABLE edificaciones
      DROP CONSTRAINT IF EXISTS ck_edificaciones_numero_niveles_declarados
    `);
    await queryRunner.query(`
      ALTER TABLE edificaciones
      ADD CONSTRAINT ck_edificaciones_numero_niveles_declarados
      CHECK (numero_niveles_declarados IS NULL OR numero_niveles_declarados >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE edificaciones
      DROP CONSTRAINT IF EXISTS ck_edificaciones_anio_construccion
    `);
    await queryRunner.query(`
      ALTER TABLE edificaciones
      ADD CONSTRAINT ck_edificaciones_anio_construccion
      CHECK (anio_construccion IS NULL OR anio_construccion >= 1500)
    `);
    await queryRunner.query(`
      ALTER TABLE niveles
      DROP CONSTRAINT IF EXISTS ck_niveles_area_m2
    `);
    await queryRunner.query(`
      ALTER TABLE niveles
      ADD CONSTRAINT ck_niveles_area_m2
      CHECK (area_m2 IS NULL OR area_m2 >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE espacios_fisicos
      DROP CONSTRAINT IF EXISTS ck_espacios_fisicos_area
    `);
    await queryRunner.query(`
      ALTER TABLE espacios_fisicos
      ADD CONSTRAINT ck_espacios_fisicos_area
      CHECK (area_m2 IS NULL OR area_m2 >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE espacios_fisicos
      DROP CONSTRAINT IF EXISTS ck_espacios_fisicos_aforo
    `);
    await queryRunner.query(`
      ALTER TABLE espacios_fisicos
      ADD CONSTRAINT ck_espacios_fisicos_aforo
      CHECK (aforo IS NULL OR aforo >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE espacios_exteriores
      DROP CONSTRAINT IF EXISTS ck_espacios_exteriores_area
    `);
    await queryRunner.query(`
      ALTER TABLE espacios_exteriores
      ADD CONSTRAINT ck_espacios_exteriores_area
      CHECK (area_m2 IS NULL OR area_m2 >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      DROP CONSTRAINT IF EXISTS ck_componentes_infraestructura_cantidad
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      ADD CONSTRAINT ck_componentes_infraestructura_cantidad
      CHECK (cantidad > 0)
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      DROP CONSTRAINT IF EXISTS ck_componentes_infraestructura_vida_util
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      ADD CONSTRAINT ck_componentes_infraestructura_vida_util
      CHECK (vida_util_meses IS NULL OR vida_util_meses >= 0)
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      DROP CONSTRAINT IF EXISTS ck_componentes_infraestructura_numero_serie
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      ADD CONSTRAINT ck_componentes_infraestructura_numero_serie
      CHECK (numero_serie IS NULL OR cantidad = 1)
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      DROP CONSTRAINT IF EXISTS fk_componentes_infraestructura_tipos_componente
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      DROP CONSTRAINT IF EXISTS fk_componentes_infraestructura_unidades_medida
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      ADD CONSTRAINT fk_componentes_infraestructura_tipos_componente
      FOREIGN KEY (id_tipo_componente)
      REFERENCES tipos_componente_infraestructura(id)
      ON DELETE RESTRICT ON UPDATE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE componentes_infraestructura
      ADD CONSTRAINT fk_componentes_infraestructura_unidades_medida
      FOREIGN KEY (id_unidad_medida)
      REFERENCES unidades_medida(id)
      ON DELETE RESTRICT ON UPDATE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE componentes_infraestructura DROP CONSTRAINT IF EXISTS fk_componentes_infraestructura_unidades_medida`,
    );
    await queryRunner.query(
      `ALTER TABLE componentes_infraestructura DROP CONSTRAINT IF EXISTS fk_componentes_infraestructura_tipos_componente`,
    );
    await queryRunner.query(
      `ALTER TABLE componentes_infraestructura DROP CONSTRAINT IF EXISTS ck_componentes_infraestructura_numero_serie`,
    );
    await queryRunner.query(
      `ALTER TABLE componentes_infraestructura DROP CONSTRAINT IF EXISTS ck_componentes_infraestructura_vida_util`,
    );
    await queryRunner.query(
      `ALTER TABLE componentes_infraestructura DROP CONSTRAINT IF EXISTS ck_componentes_infraestructura_cantidad`,
    );
    await queryRunner.query(
      `ALTER TABLE espacios_exteriores DROP CONSTRAINT IF EXISTS ck_espacios_exteriores_area`,
    );
    await queryRunner.query(
      `ALTER TABLE espacios_fisicos DROP CONSTRAINT IF EXISTS ck_espacios_fisicos_aforo`,
    );
    await queryRunner.query(
      `ALTER TABLE espacios_fisicos DROP CONSTRAINT IF EXISTS ck_espacios_fisicos_area`,
    );
    await queryRunner.query(
      `ALTER TABLE niveles DROP CONSTRAINT IF EXISTS ck_niveles_area_m2`,
    );
    await queryRunner.query(
      `ALTER TABLE edificaciones DROP CONSTRAINT IF EXISTS ck_edificaciones_anio_construccion`,
    );
    await queryRunner.query(
      `ALTER TABLE edificaciones DROP CONSTRAINT IF EXISTS ck_edificaciones_numero_niveles_declarados`,
    );
    await queryRunner.query(
      `ALTER TABLE edificaciones DROP CONSTRAINT IF EXISTS ck_edificaciones_areas`,
    );
    await queryRunner.query(
      `ALTER TABLE predios DROP CONSTRAINT IF EXISTS ck_predios_area_total`,
    );
    await queryRunner.query(
      `ALTER TABLE predios DROP CONSTRAINT IF EXISTS fk_predios_tipos_tenencia_predio`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_elementos_infraestructura_estado_conservacion`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_elementos_infraestructura_sede_estado`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_elementos_infraestructura_sede_tipo`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ix_elementos_infraestructura_padre`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ux_elementos_infraestructura_id_sede`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS ux_elementos_infraestructura_sede_codigo`,
    );
    await queryRunner.query(
      `ALTER TABLE elementos_infraestructura DROP CONSTRAINT IF EXISTS ck_elementos_infraestructura_padre_distinto`,
    );
    await queryRunner.query(
      `ALTER TABLE elementos_infraestructura DROP CONSTRAINT IF EXISTS ck_elementos_infraestructura_fechas`,
    );
    await queryRunner.query(
      `ALTER TABLE elementos_infraestructura DROP CONSTRAINT IF EXISTS ck_elementos_infraestructura_orden`,
    );
    await queryRunner.query(
      `ALTER TABLE elementos_infraestructura DROP CONSTRAINT IF EXISTS ck_elementos_infraestructura_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE estados_conservacion DROP CONSTRAINT IF EXISTS ck_estados_conservacion_orden`,
    );
    await queryRunner.query(
      `ALTER TABLE servicios_basicos_sede DROP CONSTRAINT IF EXISTS ck_servicios_basicos_sede_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE direcciones_sede DROP CONSTRAINT IF EXISTS ck_direcciones_sede_longitud`,
    );
    await queryRunner.query(
      `ALTER TABLE direcciones_sede DROP CONSTRAINT IF EXISTS ck_direcciones_sede_latitud`,
    );
    await queryRunner.query(
      `ALTER TABLE ubigeos DROP CONSTRAINT IF EXISTS ck_ubigeos_padre_distinto`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS ux_sedes_principal_activa`);
    await queryRunner.query(
      `ALTER TABLE sedes DROP CONSTRAINT IF EXISTS ck_sedes_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE instituciones_educativas DROP CONSTRAINT IF EXISTS ck_instituciones_educativas_estado`,
    );
    await queryRunner.query(
      `ALTER TABLE unidades_medida DROP COLUMN IF EXISTS magnitud`,
    );
    await queryRunner.query(
      `ALTER TABLE unidades_medida DROP COLUMN IF EXISTS simbolo`,
    );
  }
}
