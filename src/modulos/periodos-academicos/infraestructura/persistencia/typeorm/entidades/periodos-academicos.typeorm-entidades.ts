import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('anios_academicos')
@Index(['institucionId'])
export class AnioAcademicoTypeormEntidad {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionId!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'integer' })
  anio!: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: Date;

  @Column({ type: 'varchar', length: 20, default: 'PLANIFICADO' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'timestamptz' })
  fechaActualizacion!: Date;
}

@Entity('periodos_academicos')
@Index(['anioAcademicoId'])
export class PeriodoAcademicoTypeormEntidad {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'id_anio_academico', type: 'uuid' })
  anioAcademicoId!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionId!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ type: 'integer', default: 1 })
  orden!: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: Date;

  @Column({ type: 'varchar', length: 20, default: 'PLANIFICADO' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'timestamptz' })
  fechaActualizacion!: Date;

  @ManyToOne(() => AnioAcademicoTypeormEntidad)
  @JoinColumn({ name: 'id_anio_academico' })
  anioAcademico?: AnioAcademicoTypeormEntidad;
}
