import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('grados_educativos')
@Index('ix_grados_educativos_nivel_estado', [
  'idInstitucionEducativa',
  'idNivelEducativo',
  'estado',
])
export class GradoEducativoEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_nivel_educativo', type: 'uuid' })
  idNivelEducativo!: string;

  @Column({ name: 'codigo', length: 30 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', length: 30 })
  codigoNormalizado!: string;

  @Column({ name: 'nombre', length: 100 })
  nombre!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'orden', type: 'smallint', default: 0 })
  orden!: number;

  @Column({ name: 'estado', length: 20, default: 'ACTIVO' })
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
