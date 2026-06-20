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
import { IdentidadSedeTypeormEntidad } from './identidad-sede.typeorm-entidad';

@Entity({ name: 'recursos_identidad_sede' })
@Index(
  'ux_recursos_identidad_sede_identidad_tipo_activo',
  ['identidadSedeId', 'tipoRecurso', 'activo'],
  {
    unique: true,
  },
)
export class RecursoIdentidadSedeTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_identidad_sede', type: 'uuid' })
  identidadSedeId!: string;

  @ManyToOne(() => IdentidadSedeTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_identidad_sede',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_recursos_identidad_sede_identidades_sede',
  })
  identidadSede!: IdentidadSedeTypeormEntidad;

  @Column({ name: 'tipo_recurso', type: 'varchar', length: 30 })
  tipoRecurso!: string;

  @Column({ name: 'url_recurso', type: 'varchar', length: 500 })
  urlRecurso!: string;

  @Column({ name: 'tipo_mime', type: 'varchar', length: 100, nullable: true })
  tipoMime!: string | null;

  @Column({
    name: 'texto_alternativo',
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  textoAlternativo!: string | null;

  @Column({ name: 'orden', type: 'integer', default: 0 })
  orden!: number;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
