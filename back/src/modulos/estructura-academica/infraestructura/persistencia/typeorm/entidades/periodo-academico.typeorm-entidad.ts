import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('periodos_academicos')
@Index('ix_periodos_academicos_anio_estado', [
  'idInstitucionEducativa',
  'idAnioAcademico',
  'estado',
])
export class PeriodoAcademicoEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_anio_academico', type: 'uuid' })
  idAnioAcademico!: string;

  @Column({ name: 'codigo', length: 30 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', length: 30 })
  codigoNormalizado!: string;

  @Column({ name: 'nombre', length: 100 })
  nombre!: string;

  @Column({ name: 'tipo', length: 30, default: 'BIMESTRE' })
  tipo!: string;

  @Column({ name: 'orden', type: 'smallint', default: 0 })
  orden!: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: string;

  @Column({ name: 'estado', length: 20, default: 'PLANIFICADO' })
  estado!: string;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaCreacion!: Date;

  @Column({
    name: 'fecha_modificacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaModificacion!: Date;
}
