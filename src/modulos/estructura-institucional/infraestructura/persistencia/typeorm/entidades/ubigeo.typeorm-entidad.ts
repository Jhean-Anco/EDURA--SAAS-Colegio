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

@Entity({ name: 'ubigeos' })
@Index('ux_ubigeos_codigo', ['codigo'], { unique: true })
export class UbigeoTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_ubigeo_padre', type: 'uuid', nullable: true })
  idUbigeoPadre!: string | null;

  @ManyToOne(() => UbigeoTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({
    name: 'id_ubigeo_padre',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_ubigeos_ubigeos',
  })
  ubigeoPadre!: UbigeoTypeormEntidad | null;

  @Column({ name: 'codigo', type: 'varchar', length: 20 })
  codigo!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'nivel', type: 'varchar', length: 30 })
  nivel!: string;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
