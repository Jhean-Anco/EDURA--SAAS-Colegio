import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InstitucionEducativaTypeormEntidad } from './institucion-educativa.typeorm-entidad';

@Entity({ name: 'sedes' })
@Index('ux_sedes_institucion_codigo', ['institucionEducativaId', 'codigo'], {
  unique: true,
})
@Index(
  'ix_sedes_institucion_principal',
  ['institucionEducativaId', 'esPrincipal'],
  {},
)
export class SedeTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;

  @ManyToOne(() => InstitucionEducativaTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_institucion_educativa',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_sedes_instituciones_educativas',
  })
  institucionEducativa!: InstitucionEducativaTypeormEntidad;

  @Column({ name: 'codigo', type: 'varchar', length: 30 })
  codigo!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
