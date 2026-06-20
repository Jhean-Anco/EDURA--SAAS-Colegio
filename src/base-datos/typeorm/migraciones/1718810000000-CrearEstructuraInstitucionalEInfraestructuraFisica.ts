import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearEstructuraInstitucionalEInfraestructuraFisica1718810000000 implements MigrationInterface {
  name = 'CrearEstructuraInstitucionalEInfraestructuraFisica1718810000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE instituciones_educativas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo varchar(30) NOT NULL,
        nombre_legal varchar(200) NOT NULL,
        nombre_corto varchar(100),
        tipo_gestion varchar(30),
        estado varchar(20) NOT NULL,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ux_instituciones_educativas_codigo UNIQUE (codigo)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE sedes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa uuid NOT NULL,
        codigo varchar(30) NOT NULL,
        nombre varchar(150) NOT NULL,
        es_principal boolean NOT NULL DEFAULT false,
        estado varchar(20) NOT NULL,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_sedes_instituciones_educativas FOREIGN KEY (id_institucion_educativa) REFERENCES instituciones_educativas(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ux_sedes_institucion_codigo UNIQUE (id_institucion_educativa, codigo)
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX ux_sedes_principal_activa ON sedes (id_institucion_educativa) WHERE es_principal AND estado = 'ACTIVA'`,
    );
    await queryRunner.query(`
      CREATE TABLE ubigeos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_ubigeo_padre uuid,
        codigo varchar(20) NOT NULL,
        nombre varchar(150) NOT NULL,
        nivel varchar(30) NOT NULL,
        estado varchar(20) NOT NULL,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT ux_ubigeos_codigo UNIQUE (codigo),
        CONSTRAINT fk_ubigeos_ubigeos FOREIGN KEY (id_ubigeo_padre) REFERENCES ubigeos(id) ON DELETE RESTRICT ON UPDATE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE TABLE direcciones_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_sede uuid NOT NULL UNIQUE,
        id_ubigeo uuid,
        direccion_linea varchar(250) NOT NULL,
        referencia varchar(250),
        latitud numeric(10,7),
        longitud numeric(10,7),
        codigo_postal varchar(15),
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_direcciones_sede_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_direcciones_sede_ubigeos FOREIGN KEY (id_ubigeo) REFERENCES ubigeos(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_direcciones_sede_latitud CHECK (latitud IS NULL OR (latitud BETWEEN -90 AND 90)),
        CONSTRAINT ck_direcciones_sede_longitud CHECK (longitud IS NULL OR (longitud BETWEEN -180 AND 180))
      )
    `);
    const cat = [
      [
        'tipos_servicio_basico',
        'codigo varchar(40) UNIQUE NOT NULL, nombre varchar(100) NOT NULL, descripcion varchar(300), activo boolean NOT NULL DEFAULT true',
      ],
      [
        'tipos_elemento_infraestructura',
        'codigo varchar(40) UNIQUE NOT NULL, nombre varchar(100) NOT NULL, descripcion varchar(300), activo boolean NOT NULL DEFAULT true',
      ],
      [
        'estados_conservacion',
        'codigo varchar(40) UNIQUE NOT NULL, nombre varchar(100) NOT NULL, orden smallint NOT NULL, activo boolean NOT NULL DEFAULT true',
      ],
      [
        'tipos_tenencia_predio',
        'codigo varchar(40) UNIQUE NOT NULL, nombre varchar(100) NOT NULL, descripcion varchar(300), activo boolean NOT NULL DEFAULT true',
      ],
      [
        'tipos_edificacion',
        'codigo varchar(40) UNIQUE NOT NULL, nombre varchar(100) NOT NULL, descripcion varchar(300), activo boolean NOT NULL DEFAULT true',
      ],
      [
        'tipos_espacio_fisico',
        'codigo varchar(40) UNIQUE NOT NULL, nombre varchar(100) NOT NULL, descripcion varchar(300), activo boolean NOT NULL DEFAULT true, requiere_aforo boolean NOT NULL DEFAULT true',
      ],
      [
        'tipos_espacio_exterior',
        'codigo varchar(40) UNIQUE NOT NULL, nombre varchar(100) NOT NULL, descripcion varchar(300), activo boolean NOT NULL DEFAULT true',
      ],
      [
        'tipos_componente_infraestructura',
        'codigo varchar(50) UNIQUE NOT NULL, nombre varchar(120) NOT NULL, categoria varchar(80) NOT NULL, descripcion varchar(300), activo boolean NOT NULL DEFAULT true',
      ],
      [
        'unidades_medida',
        'codigo varchar(40) UNIQUE NOT NULL, nombre varchar(100) NOT NULL, descripcion varchar(300), activo boolean NOT NULL DEFAULT true',
      ],
    ] as const;
    for (const [tabla, columnas] of cat) {
      await queryRunner.query(
        `CREATE TABLE ${tabla} (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), ${columnas}, fecha_creacion timestamptz NOT NULL DEFAULT now(), fecha_modificacion timestamptz NOT NULL DEFAULT now())`,
      );
    }
    await queryRunner.query(`
      CREATE TABLE servicios_basicos_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_sede uuid NOT NULL,
        id_tipo_servicio_basico uuid NOT NULL,
        proveedor varchar(150),
        numero_suministro varchar(100),
        estado_servicio varchar(30) NOT NULL,
        fecha_inicio date,
        fecha_fin date,
        observaciones text,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_servicios_basicos_sede_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_servicios_basicos_sede_tipos_servicio_basico FOREIGN KEY (id_tipo_servicio_basico) REFERENCES tipos_servicio_basico(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_servicios_basicos_sede_fechas CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE elementos_infraestructura (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_sede uuid NOT NULL,
        id_elemento_padre uuid,
        id_tipo_elemento uuid NOT NULL,
        id_estado_conservacion uuid,
        codigo varchar(40) NOT NULL,
        nombre varchar(150) NOT NULL,
        descripcion text,
        estado varchar(20) NOT NULL,
        orden integer NOT NULL DEFAULT 0,
        fecha_alta date,
        fecha_baja date,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_elementos_infraestructura_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_elementos_infraestructura_tipos_elemento FOREIGN KEY (id_tipo_elemento) REFERENCES tipos_elemento_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT fk_elementos_infraestructura_estados_conservacion FOREIGN KEY (id_estado_conservacion) REFERENCES estados_conservacion(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ux_elementos_infraestructura_sede_codigo UNIQUE (id_sede, codigo),
        CONSTRAINT ux_elementos_infraestructura_id_sede UNIQUE (id, id_sede),
        CONSTRAINT ck_elementos_infraestructura_orden CHECK (orden >= 0),
        CONSTRAINT ck_elementos_infraestructura_fechas CHECK (fecha_baja IS NULL OR fecha_alta IS NULL OR fecha_baja >= fecha_alta),
        CONSTRAINT ck_elementos_infraestructura_estado CHECK (estado IN ('ACTIVO','INACTIVO','BAJA'))
      )
    `);
    await queryRunner.query(
      `ALTER TABLE elementos_infraestructura ADD CONSTRAINT fk_elementos_infraestructura_padre_misma_sede FOREIGN KEY (id_elemento_padre, id_sede) REFERENCES elementos_infraestructura(id, id_sede) ON DELETE RESTRICT ON UPDATE RESTRICT`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_elementos_infraestructura_padre ON elementos_infraestructura (id_elemento_padre)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_elementos_infraestructura_sede_tipo ON elementos_infraestructura (id_sede, id_tipo_elemento)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_elementos_infraestructura_sede_estado ON elementos_infraestructura (id_sede, estado)`,
    );
    await queryRunner.query(
      `CREATE INDEX ix_elementos_infraestructura_estado_conservacion ON elementos_infraestructura (id_estado_conservacion)`,
    );
    await queryRunner.query(
      `CREATE TABLE predios (id_elemento_infraestructura uuid PRIMARY KEY, id_tipo_tenencia uuid, area_total_m2 numeric(12,2), partida_registral varchar(100), codigo_catastral varchar(100), observaciones_legales text, CONSTRAINT fk_predios_elementos_infraestructura FOREIGN KEY (id_elemento_infraestructura) REFERENCES elementos_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT fk_predios_tipos_tenencia FOREIGN KEY (id_tipo_tenencia) REFERENCES tipos_tenencia_predio(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT ck_predios_area CHECK (area_total_m2 IS NULL OR area_total_m2 >= 0))`,
    );
    await queryRunner.query(
      `CREATE TABLE edificaciones (id_elemento_infraestructura uuid PRIMARY KEY, id_tipo_edificacion uuid, anio_construccion integer, area_techada_m2 numeric(12,2), area_construida_m2 numeric(12,2), material_predominante varchar(100), numero_niveles_declarados integer, cuenta_con_accesibilidad boolean NOT NULL DEFAULT false, CONSTRAINT fk_edificaciones_elementos_infraestructura FOREIGN KEY (id_elemento_infraestructura) REFERENCES elementos_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT fk_edificaciones_tipos_edificacion FOREIGN KEY (id_tipo_edificacion) REFERENCES tipos_edificacion(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT ck_edificaciones_areas CHECK ((area_techada_m2 IS NULL OR area_techada_m2 >= 0) AND (area_construida_m2 IS NULL OR area_construida_m2 >= 0) AND (numero_niveles_declarados IS NULL OR numero_niveles_declarados >= 0))`,
    );
    await queryRunner.query(
      `CREATE TABLE niveles (id_elemento_infraestructura uuid PRIMARY KEY, numero_nivel integer NOT NULL, denominacion varchar(100), cota_metros numeric(8,2), area_m2 numeric(12,2), CONSTRAINT fk_niveles_elementos_infraestructura FOREIGN KEY (id_elemento_infraestructura) REFERENCES elementos_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT ck_niveles_area CHECK (area_m2 IS NULL OR area_m2 >= 0))`,
    );
    await queryRunner.query(
      `CREATE TABLE espacios_fisicos (id_elemento_infraestructura uuid PRIMARY KEY, id_tipo_espacio_fisico uuid NOT NULL, area_m2 numeric(12,2), aforo integer, uso_actual varchar(150), es_accesible boolean NOT NULL DEFAULT false, cuenta_con_ventilacion boolean NOT NULL DEFAULT false, cuenta_con_iluminacion boolean NOT NULL DEFAULT false, CONSTRAINT fk_espacios_fisicos_elementos_infraestructura FOREIGN KEY (id_elemento_infraestructura) REFERENCES elementos_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT fk_espacios_fisicos_tipos_espacio_fisico FOREIGN KEY (id_tipo_espacio_fisico) REFERENCES tipos_espacio_fisico(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT ck_espacios_fisicos CHECK ((area_m2 IS NULL OR area_m2 >= 0) AND (aforo IS NULL OR aforo >= 0)) )`,
    );
    await queryRunner.query(
      `CREATE TABLE espacios_exteriores (id_elemento_infraestructura uuid PRIMARY KEY, id_tipo_espacio_exterior uuid NOT NULL, area_m2 numeric(12,2), es_techado boolean NOT NULL DEFAULT false, es_accesible boolean NOT NULL DEFAULT false, tipo_superficie varchar(100), CONSTRAINT fk_espacios_exteriores_elementos_infraestructura FOREIGN KEY (id_elemento_infraestructura) REFERENCES elementos_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT fk_espacios_exteriores_tipos_espacio_exterior FOREIGN KEY (id_tipo_espacio_exterior) REFERENCES tipos_espacio_exterior(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT ck_espacios_exteriores_area CHECK (area_m2 IS NULL OR area_m2 >= 0))`,
    );
    await queryRunner.query(
      `CREATE TABLE componentes_infraestructura (id_elemento_infraestructura uuid PRIMARY KEY, id_tipo_componente uuid NOT NULL, id_unidad_medida uuid NOT NULL, cantidad numeric(12,2) NOT NULL DEFAULT 1, material varchar(100), marca varchar(100), modelo varchar(100), fecha_instalacion date, vida_util_meses integer, numero_serie varchar(150), CONSTRAINT fk_componentes_infraestructura_elementos_infraestructura FOREIGN KEY (id_elemento_infraestructura) REFERENCES elementos_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT fk_componentes_infraestructura_tipos_componente FOREIGN KEY (id_tipo_componente) REFERENCES tipos_componente_infraestructura(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT fk_componentes_infraestructura_unidades_medida FOREIGN KEY (id_unidad_medida) REFERENCES unidades_medida(id) ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT ck_componentes_infraestructura CHECK (cantidad > 0 AND (vida_util_meses IS NULL OR vida_util_meses >= 0)) )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS componentes_infraestructura`);
    await queryRunner.query(`DROP TABLE IF EXISTS espacios_exteriores`);
    await queryRunner.query(`DROP TABLE IF EXISTS espacios_fisicos`);
    await queryRunner.query(`DROP TABLE IF EXISTS niveles`);
    await queryRunner.query(`DROP TABLE IF EXISTS edificaciones`);
    await queryRunner.query(`DROP TABLE IF EXISTS predios`);
    await queryRunner.query(`DROP TABLE IF EXISTS elementos_infraestructura`);
    await queryRunner.query(`DROP TABLE IF EXISTS servicios_basicos_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS unidades_medida`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS tipos_componente_infraestructura`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS tipos_espacio_exterior`);
    await queryRunner.query(`DROP TABLE IF EXISTS tipos_espacio_fisico`);
    await queryRunner.query(`DROP TABLE IF EXISTS tipos_edificacion`);
    await queryRunner.query(`DROP TABLE IF EXISTS tipos_tenencia_predio`);
    await queryRunner.query(`DROP TABLE IF EXISTS estados_conservacion`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS tipos_elemento_infraestructura`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS tipos_servicio_basico`);
    await queryRunner.query(`DROP TABLE IF EXISTS direcciones_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS ubigeos`);
    await queryRunner.query(`DROP TABLE IF EXISTS sedes`);
    await queryRunner.query(`DROP TABLE IF EXISTS instituciones_educativas`);
  }
}
