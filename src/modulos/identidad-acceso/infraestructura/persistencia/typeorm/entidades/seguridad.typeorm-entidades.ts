import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'usuarios' })
@Index('ux_usuarios_correo_normalizado', ['correoNormalizado'], {
  unique: true,
})
export class UsuarioTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'correo', type: 'varchar', length: 320 })
  correo!: string;
  @Column({ name: 'correo_normalizado', type: 'varchar', length: 320 })
  correoNormalizado!: string;
  @Column({ name: 'nombre_mostrado', type: 'varchar', length: 150 })
  nombreMostrado!: string;
  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado!: string;
  @Column({ name: 'correo_verificado', type: 'boolean', default: false })
  correoVerificado!: boolean;
  @Column({ name: 'fecha_verificacion', type: 'timestamptz', nullable: true })
  fechaVerificacion!: Date | null;
  @Column({ name: 'ultimo_acceso', type: 'timestamptz', nullable: true })
  ultimoAcceso!: Date | null;
  @Column({ name: 'version_seguridad', type: 'integer', default: 1 })
  versionSeguridad!: number;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'credenciales_usuario' })
export class CredencialUsuarioTypeormEntidad {
  @PrimaryColumn({ name: 'id_usuario', type: 'uuid' })
  idUsuario!: string;
  @Column({ name: 'hash_clave', type: 'varchar', length: 255 })
  hashClave!: string;
  @Column({
    name: 'algoritmo',
    type: 'varchar',
    length: 30,
    default: 'ARGON2ID',
  })
  algoritmo!: string;
  @Column({ name: 'requiere_cambio', type: 'boolean', default: false })
  requiereCambio!: boolean;
  @Column({ name: 'intentos_fallidos', type: 'smallint', default: 0 })
  intentosFallidos!: number;
  @Column({ name: 'bloqueado_hasta', type: 'timestamptz', nullable: true })
  bloqueadoHasta!: Date | null;
  @Column({
    name: 'fecha_cambio_clave',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaCambioClave!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'membresias_institucion' })
@Index(
  'ux_membresias_institucion_usuario_institucion',
  ['usuarioId', 'institucionEducativaId'],
  { unique: true },
)
export class MembresiaInstitucionTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'id_usuario', type: 'uuid' })
  usuarioId!: string;
  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;
  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado!: string;
  @Column({ name: 'fecha_inicio', type: 'timestamptz', nullable: true })
  fechaInicio!: Date | null;
  @Column({ name: 'fecha_fin', type: 'timestamptz', nullable: true })
  fechaFin!: Date | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'roles' })
export class RolTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'codigo', type: 'varchar', length: 80 })
  codigo!: string;
  @Column({ name: 'nombre', type: 'varchar', length: 120 })
  nombre!: string;
  @Column({ name: 'descripcion', type: 'varchar', length: 400, nullable: true })
  descripcion!: string | null;
  @Column({ name: 'ambito', type: 'varchar', length: 20 })
  ambito!: string;
  @Column({ name: 'es_sistema', type: 'boolean', default: true })
  esSistema!: boolean;
  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'permisos' })
export class PermisoTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'codigo', type: 'varchar', length: 120 })
  codigo!: string;
  @Column({ name: 'recurso', type: 'varchar', length: 80 })
  recurso!: string;
  @Column({ name: 'accion', type: 'varchar', length: 50 })
  accion!: string;
  @Column({ name: 'descripcion', type: 'varchar', length: 400, nullable: true })
  descripcion!: string | null;
  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'roles_permisos' })
export class RolPermisoTypeormEntidad {
  @PrimaryColumn({ name: 'id_rol', type: 'uuid' })
  rolId!: string;
  @PrimaryColumn({ name: 'id_permiso', type: 'uuid' })
  permisoId!: string;
  @CreateDateColumn({ name: 'fecha_asignacion', type: 'timestamptz' })
  fechaAsignacion!: Date;
}

@Entity({ name: 'asignaciones_rol_usuario' })
export class AsignacionRolUsuarioTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'id_usuario', type: 'uuid' })
  usuarioId!: string;
  @Column({ name: 'id_rol', type: 'uuid' })
  rolId!: string;
  @Column({ name: 'id_membresia_institucion', type: 'uuid', nullable: true })
  membresiaInstitucionId!: string | null;
  @Column({ name: 'id_sede', type: 'uuid', nullable: true })
  sedeId!: string | null;
  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;
  @CreateDateColumn({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio!: Date;
  @Column({ name: 'fecha_fin', type: 'timestamptz', nullable: true })
  fechaFin!: Date | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
}

@Entity({ name: 'invitaciones_acceso' })
export class InvitacionAccesoTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;
  @Column({ name: 'id_sede', type: 'uuid', nullable: true })
  sedeId!: string | null;
  @Column({ name: 'id_rol_inicial', type: 'uuid', nullable: true })
  rolInicialId!: string | null;
  @Column({ name: 'id_usuario_invitador', type: 'uuid' })
  usuarioInvitadorId!: string;
  @Column({ name: 'id_usuario_aceptante', type: 'uuid', nullable: true })
  usuarioAceptanteId!: string | null;
  @Column({ name: 'correo_destino', type: 'varchar', length: 320 })
  correoDestino!: string;
  @Column({ name: 'correo_normalizado', type: 'varchar', length: 320 })
  correoNormalizado!: string;
  @Column({ name: 'token_hash', type: 'varchar', length: 128, unique: true })
  tokenHash!: string;
  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado!: string;
  @Column({ name: 'fecha_expiracion', type: 'timestamptz' })
  fechaExpiracion!: Date;
  @Column({ name: 'fecha_aceptacion', type: 'timestamptz', nullable: true })
  fechaAceptacion!: Date | null;
  @Column({ name: 'fecha_revocacion', type: 'timestamptz', nullable: true })
  fechaRevocacion!: Date | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
}

@Entity({ name: 'sesiones_usuario' })
export class SesionUsuarioTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'id_usuario', type: 'uuid' })
  usuarioId!: string;
  @Column({ name: 'id_sesion_anterior', type: 'uuid', nullable: true })
  sesionAnteriorId!: string | null;
  @Column({
    name: 'token_actualizacion_hash',
    type: 'varchar',
    length: 128,
    unique: true,
  })
  tokenActualizacionHash!: string;
  @Column({ name: 'identificador_familia', type: 'uuid' })
  identificadorFamilia!: string;
  @Column({ name: 'fecha_expiracion', type: 'timestamptz' })
  fechaExpiracion!: Date;
  @Column({ name: 'fecha_revocacion', type: 'timestamptz', nullable: true })
  fechaRevocacion!: Date | null;
  @Column({
    name: 'motivo_revocacion',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  motivoRevocacion!: string | null;
  @Column({ name: 'direccion_ip', type: 'inet', nullable: true })
  direccionIp!: string | null;
  @Column({
    name: 'agente_usuario',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  agenteUsuario!: string | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @Column({ name: 'ultimo_uso', type: 'timestamptz', nullable: true })
  ultimoUso!: Date | null;
}

@Entity({ name: 'tokens_seguridad_usuario' })
export class TokenSeguridadUsuarioTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'id_usuario', type: 'uuid' })
  usuarioId!: string;
  @Column({ name: 'tipo', type: 'varchar', length: 30 })
  tipo!: string;
  @Column({ name: 'token_hash', type: 'varchar', length: 128, unique: true })
  tokenHash!: string;
  @Column({ name: 'fecha_expiracion', type: 'timestamptz' })
  fechaExpiracion!: Date;
  @Column({ name: 'fecha_consumo', type: 'timestamptz', nullable: true })
  fechaConsumo!: Date | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
}

@Entity({ name: 'eventos_auditoria' })
export class EventoAuditoriaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'id_institucion_educativa', type: 'uuid', nullable: true })
  institucionEducativaId!: string | null;
  @Column({ name: 'id_sede', type: 'uuid', nullable: true })
  sedeId!: string | null;
  @Column({ name: 'id_usuario', type: 'uuid', nullable: true })
  usuarioId!: string | null;
  @Column({ name: 'accion', type: 'varchar', length: 120 })
  accion!: string;
  @Column({ name: 'recurso', type: 'varchar', length: 100 })
  recurso!: string;
  @Column({ name: 'id_recurso', type: 'varchar', length: 100, nullable: true })
  recursoId!: string | null;
  @Column({ name: 'resultado', type: 'varchar', length: 20 })
  resultado!: string;
  @Column({ name: 'datos_anteriores', type: 'jsonb', nullable: true })
  datosAnteriores!: Record<string, unknown> | null;
  @Column({ name: 'datos_nuevos', type: 'jsonb', nullable: true })
  datosNuevos!: Record<string, unknown> | null;
  @Column({ name: 'metadatos', type: 'jsonb', nullable: true })
  metadatos!: Record<string, unknown> | null;
  @Column({ name: 'id_correlacion', type: 'uuid' })
  idCorrelacion!: string;
  @Column({ name: 'direccion_ip', type: 'inet', nullable: true })
  direccionIp!: string | null;
  @Column({
    name: 'agente_usuario',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  agenteUsuario!: string | null;
  @CreateDateColumn({ name: 'fecha_evento', type: 'timestamptz' })
  fechaEvento!: Date;
}

@Entity({ name: 'configuraciones_institucion' })
export class ConfiguracionInstitucionTypeormEntidad {
  @PrimaryColumn({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;
  @Column({
    name: 'zona_horaria',
    type: 'varchar',
    length: 60,
    default: 'America/Lima',
  })
  zonaHoraria!: string;
  @Column({ name: 'idioma', type: 'varchar', length: 10, default: 'es-PE' })
  idioma!: string;
  @Column({
    name: 'formato_fecha',
    type: 'varchar',
    length: 30,
    default: 'DD/MM/YYYY',
  })
  formatoFecha!: string;
  @Column({ name: 'moneda', type: 'varchar', length: 3, default: 'PEN' })
  moneda!: string;
  @Column({
    name: 'nombre_ciclo_actual',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  nombreCicloActual!: string | null;
  @Column({ name: 'configuracion', type: 'jsonb', default: () => "'{}'" })
  configuracion!: Record<string, unknown>;
  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
