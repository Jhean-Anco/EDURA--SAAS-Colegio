import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('secciones_academicas')
@Index('ix_secciones_oferta_estado', [
  'idInstitucionEducativa',
  'idOfertaGradoSede',
  'estado',
])
export class SeccionAcademicaEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_oferta_grado_sede', type: 'uuid' })
  idOfertaGradoSede!: string;

  @Column({ name: 'id_docente_tutor', type: 'uuid', nullable: true })
  idDocenteTutor!: string | null;

  @Column({ name: 'id_espacio_fisico', type: 'uuid', nullable: true })
  idEspacioFisico!: string | null;

  @Column({ name: 'codigo', length: 30 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', length: 30 })
  codigoNormalizado!: string;

  @Column({ name: 'nombre', length: 50 })
  nombre!: string;

  @Column({ name: 'turno', length: 30 })
  turno!: string;

  @Column({ name: 'capacidad_maxima', type: 'smallint', nullable: true })
  capacidadMaxima!: number | null;

  @Column({ name: 'estado', length: 20, default: 'ACTIVA' })
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
