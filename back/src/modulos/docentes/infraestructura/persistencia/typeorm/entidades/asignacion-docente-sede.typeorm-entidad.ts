import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'asignaciones_docente_sede' })
@Index('ix_asignaciones_docente_sede_institucion_docente_estado', [
  'institucionId',
  'docenteId',
  'estado',
])
@Index('ix_asignaciones_docente_sede_institucion_sede_estado', [
  'institucionId',
  'sedeId',
  'estado',
])
export class AsignacionDocenteSedeTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionId!: string;

  @Column({ name: 'id_docente', type: 'uuid' })
  docenteId!: string;

  @Column({ name: 'id_sede', type: 'uuid' })
  sedeId!: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin!: string | null;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
