import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'tipos_espacio_fisico' })
@Index('ux_tipos_espacio_fisico_codigo', ['codigo'], { unique: true })
export class TipoEspacioFisicoTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' }) id!: string;
  @Column({ name: 'codigo', type: 'varchar', length: 40 }) codigo!: string;
  @Column({ name: 'nombre', type: 'varchar', length: 100 }) nombre!: string;
  @Column({ name: 'descripcion', type: 'varchar', length: 300, nullable: true })
  descripcion!: string | null;
  @Column({ name: 'activo', type: 'boolean', default: true }) activo!: boolean;
  @Column({ name: 'requiere_aforo', type: 'boolean', default: true })
  requiereAforo!: boolean;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
