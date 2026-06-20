import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarIdentidadYPresenciaDigitalSedeV031718830000000 implements MigrationInterface {
  name = 'AgregarIdentidadYPresenciaDigitalSedeV031718830000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS identidades_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_sede uuid NOT NULL,
        nombre_publico varchar(180) NOT NULL,
        lema varchar(250),
        descripcion_corta varchar(500),
        color_primario varchar(7),
        color_secundario varchar(7),
        color_acento varchar(7),
        tipografia_titulos varchar(100),
        tipografia_textos varchar(100),
        slug_publico varchar(120),
        usar_en_portal_interno boolean NOT NULL DEFAULT true,
        usar_en_pagina_publica boolean NOT NULL DEFAULT true,
        estado_publicacion varchar(20) NOT NULL DEFAULT 'BORRADOR',
        fecha_publicacion timestamptz,
        version integer NOT NULL DEFAULT 1,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_identidades_sede_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ux_identidades_sede_id_sede UNIQUE (id_sede),
        CONSTRAINT ck_identidades_sede_colores CHECK (
          (color_primario IS NULL OR color_primario ~ '^#[0-9A-Fa-f]{6}$')
          AND (color_secundario IS NULL OR color_secundario ~ '^#[0-9A-Fa-f]{6}$')
          AND (color_acento IS NULL OR color_acento ~ '^#[0-9A-Fa-f]{6}$')
        ),
        CONSTRAINT ck_identidades_sede_estado_publicacion CHECK (estado_publicacion IN ('BORRADOR', 'PUBLICADA', 'INACTIVA')),
        CONSTRAINT ck_identidades_sede_version CHECK (version > 0)
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_identidades_sede_slug_publico
      ON identidades_sede (slug_publico)
      WHERE slug_publico IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS recursos_identidad_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_identidad_sede uuid NOT NULL,
        tipo_recurso varchar(30) NOT NULL,
        url_recurso varchar(500) NOT NULL,
        tipo_mime varchar(100),
        texto_alternativo varchar(250),
        orden integer NOT NULL DEFAULT 0,
        activo boolean NOT NULL DEFAULT true,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_recursos_identidad_sede_identidades_sede FOREIGN KEY (id_identidad_sede) REFERENCES identidades_sede(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_recursos_identidad_sede_orden CHECK (orden >= 0),
        CONSTRAINT ck_recursos_identidad_sede_tipo CHECK (tipo_recurso IN ('LOGOTIPO', 'ISOTIPO', 'FAVICON', 'PORTADA', 'FONDO'))
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_recursos_identidad_sede_identidad_tipo_activo
      ON recursos_identidad_sede (id_identidad_sede, tipo_recurso)
      WHERE activo = true
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS canales_contacto_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_sede uuid NOT NULL,
        tipo_canal varchar(30) NOT NULL,
        etiqueta varchar(100),
        valor varchar(300) NOT NULL,
        valor_normalizado varchar(300) NOT NULL,
        es_principal boolean NOT NULL DEFAULT false,
        visible_publicamente boolean NOT NULL DEFAULT false,
        orden integer NOT NULL DEFAULT 0,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVO',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_canales_contacto_sede_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_canales_contacto_sede_orden CHECK (orden >= 0),
        CONSTRAINT ck_canales_contacto_sede_tipo CHECK (tipo_canal IN ('TELEFONO','CELULAR','WHATSAPP','CORREO','SITIO_WEB','FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK','OTRO')),
        CONSTRAINT ck_canales_contacto_sede_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_canales_contacto_sede_activo
      ON canales_contacto_sede (id_sede, tipo_canal, valor_normalizado)
      WHERE estado = 'ACTIVO'
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_canales_contacto_sede_principal
      ON canales_contacto_sede (id_sede, tipo_canal)
      WHERE es_principal = true AND estado = 'ACTIVO'
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS horarios_atencion_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_sede uuid NOT NULL,
        dia_semana smallint NOT NULL,
        orden_intervalo smallint NOT NULL DEFAULT 1,
        hora_inicio time,
        hora_fin time,
        cerrado boolean NOT NULL DEFAULT false,
        observaciones varchar(250),
        estado varchar(20) NOT NULL DEFAULT 'ACTIVO',
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_horarios_atencion_sede_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ux_horarios_atencion_sede_dia_intervalo UNIQUE (id_sede, dia_semana, orden_intervalo),
        CONSTRAINT ck_horarios_atencion_sede_dia CHECK (dia_semana BETWEEN 1 AND 7),
        CONSTRAINT ck_horarios_atencion_sede_orden CHECK (orden_intervalo > 0),
        CONSTRAINT ck_horarios_atencion_sede_estado CHECK (estado IN ('ACTIVO', 'INACTIVO')),
        CONSTRAINT ck_horarios_atencion_sede_horas CHECK (
          (cerrado = true AND hora_inicio IS NULL AND hora_fin IS NULL)
          OR
          (cerrado = false AND hora_inicio IS NOT NULL AND hora_fin IS NOT NULL AND hora_fin > hora_inicio)
        )
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS paginas_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_sede uuid NOT NULL,
        slug varchar(120) NOT NULL,
        titulo varchar(180) NOT NULL,
        resumen varchar(500),
        descripcion_seo varchar(300),
        es_pagina_inicio boolean NOT NULL DEFAULT false,
        visible_en_menu boolean NOT NULL DEFAULT true,
        orden_menu integer NOT NULL DEFAULT 0,
        estado varchar(20) NOT NULL DEFAULT 'BORRADOR',
        fecha_publicacion timestamptz,
        version integer NOT NULL DEFAULT 1,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_paginas_sede_sedes FOREIGN KEY (id_sede) REFERENCES sedes(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ux_paginas_sede_slug UNIQUE (id_sede, slug),
        CONSTRAINT ck_paginas_sede_orden CHECK (orden_menu >= 0),
        CONSTRAINT ck_paginas_sede_version CHECK (version > 0),
        CONSTRAINT ck_paginas_sede_estado CHECK (estado IN ('BORRADOR', 'PUBLICADA', 'ARCHIVADA'))
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ux_paginas_sede_inicio_publicada
      ON paginas_sede (id_sede)
      WHERE es_pagina_inicio = true AND estado = 'PUBLICADA'
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS secciones_pagina_sede (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        id_pagina_sede uuid NOT NULL,
        tipo_seccion varchar(30) NOT NULL,
        titulo varchar(180),
        contenido jsonb NOT NULL,
        orden integer NOT NULL,
        visible boolean NOT NULL DEFAULT true,
        estado varchar(20) NOT NULL DEFAULT 'ACTIVA',
        version integer NOT NULL DEFAULT 1,
        fecha_creacion timestamptz NOT NULL DEFAULT now(),
        fecha_modificacion timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_secciones_pagina_sede_paginas_sede FOREIGN KEY (id_pagina_sede) REFERENCES paginas_sede(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
        CONSTRAINT ck_secciones_pagina_sede_orden CHECK (orden >= 0),
        CONSTRAINT ck_secciones_pagina_sede_version CHECK (version > 0),
        CONSTRAINT ck_secciones_pagina_sede_tipo CHECK (tipo_seccion IN ('HERO','TEXTO','IMAGEN','GALERIA','TARJETAS','CIFRAS','CONTACTO','MAPA','LLAMADA_ACCION')),
        CONSTRAINT ck_secciones_pagina_sede_estado CHECK (estado IN ('ACTIVA','INACTIVA')),
        CONSTRAINT ux_secciones_pagina_sede_pagina_orden UNIQUE (id_pagina_sede, orden)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS secciones_pagina_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS paginas_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS horarios_atencion_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS canales_contacto_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS recursos_identidad_sede`);
    await queryRunner.query(`DROP TABLE IF EXISTS identidades_sede`);
  }
}
