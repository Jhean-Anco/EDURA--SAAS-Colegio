import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'especialidades_profesionales' })
@Index(
  'uq_especialidades_institucion_codigo',
  ['institucionId', 'codigoNormalizado'],
  { unique: true },
)
@Index(
  'uq_especialidades_institucion_nombre',
  ['institucionId', 'nombreNormalizado'],
  { unique: true },
)
@Index('ix_especialidades_profesionales_institucion_estado', [
  'institucionId',
  'estado',
])
export class EspecialidadProfesionalTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionId!: string;

  @Column({ name: 'codigo', type: 'varchar', length: 40 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', type: 'varchar', length: 40 })
  codigoNormalizado!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'nombre_normalizado', type: 'varchar', length: 150 })
  nombreNormalizado!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
