import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'docentes_especialidades_profesionales' })
@Index('ix_docentes_esp_institucion_docente', ['institucionId', 'docenteId'])
export class DocenteEspecialidadTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionId!: string;

  @Column({ name: 'id_docente', type: 'uuid' })
  docenteId!: string;

  @Column({ name: 'id_especialidad_profesional', type: 'uuid' })
  especialidadId!: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;

  @Column({
    name: 'anios_experiencia',
    type: 'smallint',
    nullable: true,
  })
  aniosExperiencia!: number | null;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
