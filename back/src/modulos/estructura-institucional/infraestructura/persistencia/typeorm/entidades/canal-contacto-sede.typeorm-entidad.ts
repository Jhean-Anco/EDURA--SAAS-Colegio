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
import { SedeTypeormEntidad } from './sede.typeorm-entidad';

@Entity({ name: 'canales_contacto_sede' })
@Index(
  'ux_canales_contacto_sede_activo',
  ['sedeId', 'tipoCanal', 'valorNormalizado'],
  {
    unique: true,
  },
)
@Index('ux_canales_contacto_sede_principal', ['sedeId', 'tipoCanal'], {
  unique: true,
})
export class CanalContactoSedeTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_sede', type: 'uuid' })
  sedeId!: string;

  @ManyToOne(() => SedeTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sede',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_canales_contacto_sede_sedes',
  })
  sede!: SedeTypeormEntidad;

  @Column({ name: 'tipo_canal', type: 'varchar', length: 30 })
  tipoCanal!: string;

  @Column({ name: 'etiqueta', type: 'varchar', length: 100, nullable: true })
  etiqueta!: string | null;

  @Column({ name: 'valor', type: 'varchar', length: 300 })
  valor!: string;

  @Column({ name: 'valor_normalizado', type: 'varchar', length: 300 })
  valorNormalizado!: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;

  @Column({ name: 'visible_publicamente', type: 'boolean', default: false })
  visiblePublicamente!: boolean;

  @Column({ name: 'orden', type: 'integer', default: 0 })
  orden!: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
