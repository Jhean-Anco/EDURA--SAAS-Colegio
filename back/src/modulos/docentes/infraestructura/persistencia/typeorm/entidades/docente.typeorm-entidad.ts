import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'docentes' })
@Index('ix_docentes_institucion_estado', ['institucionId', 'estado'])
export class DocenteTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionId!: string;

  @Column({ name: 'id_persona', type: 'uuid' })
  personaId!: string;

  @Column({ name: 'codigo', type: 'varchar', length: 40 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', type: 'varchar', length: 40 })
  codigoNormalizado!: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  @Column({ name: 'fecha_ingreso', type: 'date', nullable: true })
  fechaIngreso!: string | null;

  @Column({ name: 'fecha_cese', type: 'date', nullable: true })
  fechaCese!: string | null;

  @Column({ name: 'perfil_profesional', type: 'text', nullable: true })
  perfilProfesional!: string | null;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
