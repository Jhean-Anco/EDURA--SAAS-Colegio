import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tipos_tenencia_predio' })
@Index('ux_tipos_tenencia_predio_codigo', ['codigo'], { unique: true })
export class TipoTenenciaPredioTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'codigo', type: 'varchar', length: 40 })
  codigo!: string;
  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;
  @Column({ name: 'descripcion', type: 'varchar', length: 300, nullable: true })
  descripcion!: string | null;
  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
