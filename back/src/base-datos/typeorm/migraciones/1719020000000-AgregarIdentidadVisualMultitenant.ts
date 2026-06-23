import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgregarIdentidadVisualMultitenant1719020000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla identidades_visuales_institucion (sin FK a versiones todavia)
    await queryRunner.query(`
      CREATE TABLE identidades_visuales_institucion (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa UUID NOT NULL UNIQUE,
        id_version_publicada UUID NULL,
        estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVA', 'INACTIVA')),
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_identidad_institucion FOREIGN KEY (id_institucion_educativa)
          REFERENCES instituciones_educativas(id) ON DELETE CASCADE
      );
    `);

    // 2. Crear tabla versiones_identidad_visual
    await queryRunner.query(`
      CREATE TABLE versiones_identidad_visual (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_identidad_visual UUID NOT NULL,
        numero_version INTEGER NOT NULL,
        estado VARCHAR(20) NOT NULL CHECK (estado IN ('BORRADOR', 'PUBLICADA', 'ARCHIVADA')),
        nombre_marca VARCHAR(150) NOT NULL,
        nombre_corto_visual VARCHAR(80) NULL,
        lema VARCHAR(250) NULL,
        titulo_login VARCHAR(150) NULL,
        mensaje_login VARCHAR(400) NULL,
        texto_pie_login VARCHAR(250) NULL,
        color_primario CHAR(7) NOT NULL CHECK (color_primario ~* '^#[0-9A-Fa-f]{6}$'),
        color_sobre_primario CHAR(7) NOT NULL CHECK (color_sobre_primario ~* '^#[0-9A-Fa-f]{6}$'),
        color_secundario CHAR(7) NOT NULL CHECK (color_secundario ~* '^#[0-9A-Fa-f]{6}$'),
        color_acento CHAR(7) NOT NULL CHECK (color_acento ~* '^#[0-9A-Fa-f]{6}$'),
        color_fondo CHAR(7) NOT NULL CHECK (color_fondo ~* '^#[0-9A-Fa-f]{6}$'),
        color_superficie CHAR(7) NOT NULL CHECK (color_superficie ~* '^#[0-9A-Fa-f]{6}$'),
        color_texto_principal CHAR(7) NOT NULL CHECK (color_texto_principal ~* '^#[0-9A-Fa-f]{6}$'),
        color_texto_secundario CHAR(7) NOT NULL CHECK (color_texto_secundario ~* '^#[0-9A-Fa-f]{6}$'),
        variante_login VARCHAR(30) NOT NULL,
        id_usuario_creador UUID NOT NULL,
        id_usuario_publicador UUID NULL,
        fecha_publicacion TIMESTAMPTZ NULL,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_version_identidad FOREIGN KEY (id_identidad_visual)
          REFERENCES identidades_visuales_institucion(id) ON DELETE CASCADE,
        CONSTRAINT uq_identidad_version UNIQUE (id_identidad_visual, numero_version)
      );
    `);

    // 3. Añadir la FK id_version_publicada en identidades_visuales_institucion
    await queryRunner.query(`
      ALTER TABLE identidades_visuales_institucion
      ADD CONSTRAINT fk_identidad_version_publicada FOREIGN KEY (id_version_publicada)
        REFERENCES versiones_identidad_visual(id) ON DELETE SET NULL;
    `);

    // 4. Crear tabla activos_identidad_visual
    await queryRunner.query(`
      CREATE TABLE activos_identidad_visual (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_version_identidad_visual UUID NOT NULL,
        tipo VARCHAR(40) NOT NULL CHECK (tipo IN (
          'LOGO_PRINCIPAL', 'LOGO_HORIZONTAL', 'LOGO_FONDO_CLARO', 'LOGO_FONDO_OSCURO',
          'ISOTIPO', 'FAVICON', 'FONDO_LOGIN', 'IMAGEN_PORTADA'
        )),
        clave_almacenamiento VARCHAR(500) NOT NULL,
        nombre_original VARCHAR(255) NOT NULL,
        tipo_mime VARCHAR(100) NOT NULL,
        tamano_bytes BIGINT NOT NULL,
        ancho_pixeles INTEGER NULL,
        alto_pixeles INTEGER NULL,
        checksum_sha256 CHAR(64) NOT NULL,
        texto_alternativo VARCHAR(250) NOT NULL,
        estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVO', 'ARCHIVADO', 'RECHAZADO')),
        id_usuario_carga UUID NOT NULL,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_activo_version FOREIGN KEY (id_version_identidad_visual)
          REFERENCES versiones_identidad_visual(id) ON DELETE CASCADE
      );
    `);

    // Crear índice parcial de unicidad para activos activos por versión y tipo
    await queryRunner.query(`
      CREATE UNIQUE INDEX ux_activos_identidad_visual_tipo_activo
      ON activos_identidad_visual (id_version_identidad_visual, tipo)
      WHERE estado = 'ACTIVO';
    `);

    // 5. Crear tabla puntos_acceso_institucion
    await queryRunner.query(`
      CREATE TABLE puntos_acceso_institucion (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_institucion_educativa UUID NOT NULL,
        tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
          'SUBDOMINIO_EDURA', 'RUTA_SLUG', 'CODIGO_ACCESO', 'DOMINIO_PERSONALIZADO'
        )),
        valor VARCHAR(255) NOT NULL,
        valor_normalizado VARCHAR(255) NOT NULL,
        es_principal BOOLEAN NOT NULL DEFAULT FALSE,
        estado VARCHAR(20) NOT NULL CHECK (estado IN (
          'PENDIENTE', 'ACTIVO', 'SUSPENDIDO', 'RECHAZADO'
        )),
        token_verificacion_hash VARCHAR(128) NULL,
        fecha_verificacion TIMESTAMPTZ NULL,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_punto_acceso_institucion FOREIGN KEY (id_institucion_educativa)
          REFERENCES instituciones_educativas(id) ON DELETE CASCADE,
        CONSTRAINT uq_puntos_acceso_tipo_valor UNIQUE (tipo, valor_normalizado)
      );
    `);

    // Índices de optimización y búsqueda rápida
    await queryRunner.query(`CREATE INDEX idx_identidades_visuales_institucion_busqueda ON identidades_visuales_institucion(id_institucion_educativa);`);
    await queryRunner.query(`CREATE INDEX idx_versiones_identidad_visual_busqueda ON versiones_identidad_visual(id_identidad_visual, estado);`);
    await queryRunner.query(`CREATE INDEX idx_activos_identidad_visual_busqueda ON activos_identidad_visual(id_version_identidad_visual, tipo, estado);`);
    await queryRunner.query(`CREATE INDEX idx_puntos_acceso_institucion_resolucion ON puntos_acceso_institucion(tipo, valor_normalizado, estado);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_puntos_acceso_institucion_resolucion;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_activos_identidad_visual_busqueda;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_versiones_identidad_visual_busqueda;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_identidades_visuales_institucion_busqueda;`);
    await queryRunner.query(`DROP TABLE IF EXISTS puntos_acceso_institucion;`);
    await queryRunner.query(`DROP INDEX IF EXISTS ux_activos_identidad_visual_tipo_activo;`);
    await queryRunner.query(`DROP TABLE IF EXISTS activos_identidad_visual;`);
    
    // Quitar FK antes de eliminar tabla de versiones
    await queryRunner.query(`
      ALTER TABLE identidades_visuales_institucion
      DROP CONSTRAINT IF EXISTS fk_identidad_version_publicada;
    `);
    
    await queryRunner.query(`DROP TABLE IF EXISTS versiones_identidad_visual;`);
    await queryRunner.query(`DROP TABLE IF EXISTS identidades_visuales_institucion;`);
  }
}
