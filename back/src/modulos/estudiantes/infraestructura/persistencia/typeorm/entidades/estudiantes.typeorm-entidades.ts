import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'estudiantes' })
@Index(
  'ux_estudiantes_institucion_codigo',
  ['institucionEducativaId', 'codigo'],
  { unique: true },
)
@Index(
  'ux_estudiantes_institucion_persona',
  ['institucionEducativaId', 'personaId'],
  { unique: true },
)
@Index('ix_estudiantes_institucion_sede_estado', [
  'institucionEducativaId',
  'sedeId',
  'estado',
])
export class EstudianteTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;
  @Column({ name: 'id_sede', type: 'uuid' })
  sedeId!: string;
  @Column({ name: 'id_persona', type: 'uuid' })
  personaId!: string;
  @Column({ name: 'codigo', type: 'varchar', length: 40 })
  codigo!: string;
  @Column({ name: 'estado', type: 'varchar', length: 30, default: 'ACTIVO' })
  estado!: string;
  @Column({ name: 'fecha_ingreso', type: 'date', nullable: true })
  fechaIngreso!: string | null;
  @Column({ name: 'fecha_retiro', type: 'date', nullable: true })
  fechaRetiro!: string | null;
  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'apoderados_estudiante' })
@Index(
  'ux_apoderados_estudiante_estudiante_persona',
  ['estudianteId', 'personaId'],
  { unique: true },
)
@Index('ix_apoderados_estudiante_institucion_estudiante_estado', [
  'institucionEducativaId',
  'estudianteId',
  'estado',
])
export class ApoderadoEstudianteTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;
  @Column({ name: 'id_estudiante', type: 'uuid' })
  estudianteId!: string;
  @Column({ name: 'id_persona', type: 'uuid' })
  personaId!: string;
  @Column({ name: 'parentesco', type: 'varchar', length: 40 })
  parentesco!: string;
  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;
  @Column({ name: 'puede_recoger', type: 'boolean', default: false })
  puedeRecoger!: boolean;
  @Column({ name: 'recibe_comunicaciones', type: 'boolean', default: true })
  recibeComunicaciones!: boolean;
  @Column({ name: 'estado', type: 'varchar', length: 30, default: 'ACTIVO' })
  estado!: string;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'documentos_estudiante' })
@Index('ix_documentos_estudiante_institucion_estudiante', [
  'institucionEducativaId',
  'estudianteId',
])
export class DocumentoEstudianteTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;
  @Column({ name: 'id_estudiante', type: 'uuid' })
  estudianteId!: string;
  @Column({ name: 'tipo_documento', type: 'varchar', length: 60 })
  tipoDocumento!: string;
  @Column({ name: 'nombre', type: 'varchar', length: 160 })
  nombre!: string;
  @Column({ name: 'estado', type: 'varchar', length: 30, default: 'PENDIENTE' })
  estado!: string;
  @Column({ name: 'fecha_emision', type: 'date', nullable: true })
  fechaEmision!: string | null;
  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento!: string | null;
  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
