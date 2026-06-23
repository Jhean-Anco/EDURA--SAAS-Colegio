import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'identidades_visuales_institucion' })
export class IdentidadVisualInstitucionTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid', unique: true })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_version_publicada', type: 'uuid', nullable: true })
  idVersionPublicada!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string; // ACTIVA, INACTIVA

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;

  @OneToOne(() => VersionIdentidadVisualTypeormEntidad, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_version_publicada' })
  versionPublicada!: VersionIdentidadVisualTypeormEntidad | null;

  @OneToMany(() => VersionIdentidadVisualTypeormEntidad, (version) => version.identidadVisual)
  versiones!: VersionIdentidadVisualTypeormEntidad[];
}

@Entity({ name: 'versiones_identidad_visual' })
@Index('ux_versiones_identidad_visual_numero', ['idIdentidadVisual', 'numeroVersion'], { unique: true })
export class VersionIdentidadVisualTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_identidad_visual', type: 'uuid' })
  idIdentidadVisual!: string;

  @Column({ name: 'numero_version', type: 'integer' })
  numeroVersion!: number;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string; // BORRADOR, PUBLICADA, ARCHIVADA

  @Column({ name: 'nombre_marca', type: 'varchar', length: 150 })
  nombreMarca!: string;

  @Column({ name: 'nombre_corto_visual', type: 'varchar', length: 80, nullable: true })
  nombreCortoVisual!: string | null;

  @Column({ name: 'lema', type: 'varchar', length: 250, nullable: true })
  lema!: string | null;

  @Column({ name: 'titulo_login', type: 'varchar', length: 150, nullable: true })
  tituloLogin!: string | null;

  @Column({ name: 'mensaje_login', type: 'varchar', length: 400, nullable: true })
  mensajeLogin!: string | null;

  @Column({ name: 'texto_pie_login', type: 'varchar', length: 250, nullable: true })
  textoPieLogin!: string | null;

  @Column({ name: 'color_primario', type: 'char', length: 7 })
  colorPrimario!: string;

  @Column({ name: 'color_sobre_primario', type: 'char', length: 7 })
  colorSobrePrimario!: string;

  @Column({ name: 'color_secundario', type: 'char', length: 7 })
  colorSecundario!: string;

  @Column({ name: 'color_acento', type: 'char', length: 7 })
  colorAcento!: string;

  @Column({ name: 'color_fondo', type: 'char', length: 7 })
  colorFondo!: string;

  @Column({ name: 'color_superficie', type: 'char', length: 7 })
  colorSuperficie!: string;

  @Column({ name: 'color_texto_principal', type: 'char', length: 7 })
  colorTextoPrincipal!: string;

  @Column({ name: 'color_texto_secundario', type: 'char', length: 7 })
  colorTextoSecundario!: string;

  @Column({ name: 'variante_login', type: 'varchar', length: 30 })
  varianteLogin!: string;

  @Column({ name: 'id_usuario_creador', type: 'uuid' })
  idUsuarioCreador!: string;

  @Column({ name: 'id_usuario_publicador', type: 'uuid', nullable: true })
  idUsuarioPublicador!: string | null;

  @Column({ name: 'fecha_publicacion', type: 'timestamptz', nullable: true })
  fechaPublicacion!: Date | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;

  @ManyToOne(() => IdentidadVisualInstitucionTypeormEntidad, (identidad) => identidad.versiones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_identidad_visual' })
  identidadVisual!: IdentidadVisualInstitucionTypeormEntidad;

  @OneToMany(() => ActivoIdentidadVisualTypeormEntidad, (activo) => activo.version)
  activos!: ActivoIdentidadVisualTypeormEntidad[];
}

@Entity({ name: 'activos_identidad_visual' })
export class ActivoIdentidadVisualTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_version_identidad_visual', type: 'uuid' })
  idVersionIdentidadVisual!: string;

  @Column({ name: 'tipo', type: 'varchar', length: 40 })
  tipo!: string; // LOGO_PRINCIPAL, LOGO_HORIZONTAL, LOGO_FONDO_CLARO, LOGO_FONDO_OSCURO, ISOTIPO, FAVICON, FONDO_LOGIN, IMAGEN_PORTADA

  @Column({ name: 'clave_almacenamiento', type: 'varchar', length: 500 })
  claveAlmacenamiento!: string;

  @Column({ name: 'nombre_original', type: 'varchar', length: 255 })
  nombreOriginal!: string;

  @Column({ name: 'tipo_mime', type: 'varchar', length: 100 })
  tipoMime!: string;

  @Column({ name: 'tamano_bytes', type: 'bigint' })
  tamanoBytes!: string; // BIGINT is mapped to string in JS/TS by TypeORM

  @Column({ name: 'ancho_pixeles', type: 'integer', nullable: true })
  anchoPixeles!: number | null;

  @Column({ name: 'alto_pixeles', type: 'integer', nullable: true })
  altoPixeles!: number | null;

  @Column({ name: 'checksum_sha256', type: 'char', length: 64 })
  checksumSha256!: string;

  @Column({ name: 'texto_alternativo', type: 'varchar', length: 250 })
  textoAlternativo!: string;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string; // ACTIVO, ARCHIVADO, RECHAZADO

  @Column({ name: 'id_usuario_carga', type: 'uuid' })
  idUsuarioCarga!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;

  @ManyToOne(() => VersionIdentidadVisualTypeormEntidad, (version) => version.activos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_version_identidad_visual' })
  version!: VersionIdentidadVisualTypeormEntidad;
}

@Entity({ name: 'puntos_acceso_institucion' })
@Index('ux_puntos_acceso_institucion_tipo_valor', ['tipo', 'valorNormalizado'], { unique: true })
export class PuntoAccesoInstitucionTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'tipo', type: 'varchar', length: 30 })
  tipo!: string; // SUBDOMINIO_EDURA, RUTA_SLUG, CODIGO_ACCESO, DOMINIO_PERSONALIZADO

  @Column({ name: 'valor', type: 'varchar', length: 255 })
  valor!: string;

  @Column({ name: 'valor_normalizado', type: 'varchar', length: 255 })
  valorNormalizado!: string;

  @Column({ name: 'es_principal', type: 'boolean' })
  esPrincipal!: boolean;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string; // PENDIENTE, ACTIVO, SUSPENDIDO, RECHAZADO

  @Column({ name: 'token_verificacion_hash', type: 'varchar', length: 128, nullable: true })
  tokenVerificacionHash!: string | null;

  @Column({ name: 'fecha_verificacion', type: 'timestamptz', nullable: true })
  fechaVerificacion!: Date | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
