import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'estados_conservacion' })
@Index('ux_estados_conservacion_codigo', ['codigo'], { unique: true })
export class EstadoConservacionTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'codigo', type: 'varchar', length: 40 })
  codigo!: string;
  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;
  @Column({ name: 'orden', type: 'smallint' })
  orden!: number;
  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
