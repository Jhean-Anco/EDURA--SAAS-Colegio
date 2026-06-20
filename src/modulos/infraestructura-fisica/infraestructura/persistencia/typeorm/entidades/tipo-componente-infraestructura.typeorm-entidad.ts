import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity({ name: 'tipos_componente_infraestructura' })
@Index('ux_tipos_componente_infraestructura_codigo', ['codigo'], {
  unique: true,
})
export class TipoComponenteInfraestructuraTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' }) id!: string;
  @Column({ name: 'codigo', type: 'varchar', length: 50 }) codigo!: string;
  @Column({ name: 'nombre', type: 'varchar', length: 120 }) nombre!: string;
  @Column({ name: 'categoria', type: 'varchar', length: 80 })
  categoria!: string;
  @Column({ name: 'descripcion', type: 'varchar', length: 300, nullable: true })
  descripcion!: string | null;
  @Column({ name: 'activo', type: 'boolean', default: true }) activo!: boolean;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
