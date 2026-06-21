import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('anios_academicos')
@Index('ix_anios_academicos_institucion_estado', [
  'idInstitucionEducativa',
  'estado',
])
export class AnioAcademicoEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'anio', type: 'smallint' })
  anio!: number;

  @Column({ name: 'codigo', length: 30 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', length: 30 })
  codigoNormalizado!: string;

  @Column({ name: 'nombre', length: 100 })
  nombre!: string;

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
