import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ofertas_grado_sede')
@Index('ix_ofertas_grado_sede_sede_anio', [
  'idInstitucionEducativa',
  'idSede',
  'idAnioAcademico',
  'estado',
])
export class OfertaGradoSedeEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_sede', type: 'uuid' })
  idSede!: string;

  @Column({ name: 'id_grado_educativo', type: 'uuid' })
  idGradoEducativo!: string;

  @Column({ name: 'id_anio_academico', type: 'uuid' })
  idAnioAcademico!: string;

  @Column({ name: 'capacidad_referencial', type: 'smallint', nullable: true })
  capacidadReferencial!: number | null;

  @Column({ name: 'estado', length: 20, default: 'PLANIFICADA' })
  estado!: string;

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
