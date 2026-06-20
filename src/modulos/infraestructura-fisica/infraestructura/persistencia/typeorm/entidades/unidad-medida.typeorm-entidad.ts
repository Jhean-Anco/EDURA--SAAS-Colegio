import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'unidades_medida' })
@Index('ux_unidades_medida_codigo', ['codigo'], { unique: true })
export class UnidadMedidaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'codigo', type: 'varchar', length: 40 }) codigo!: string;
  @Column({ name: 'nombre', type: 'varchar', length: 100 }) nombre!: string;
  @Column({ name: 'simbolo', type: 'varchar', length: 20, nullable: true })
  simbolo!: string | null;
  @Column({ name: 'magnitud', type: 'varchar', length: 40 })
  magnitud!: string;
  @Column({ name: 'descripcion', type: 'varchar', length: 300, nullable: true })
  descripcion!: string | null;
  @Column({ name: 'activo', type: 'boolean', default: true }) activo!: boolean;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
