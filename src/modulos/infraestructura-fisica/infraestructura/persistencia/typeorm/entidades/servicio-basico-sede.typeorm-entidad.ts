import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SedeTypeormEntidad } from '../../../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { TipoServicioBasicoTypeormEntidad } from './tipo-servicio-basico.typeorm-entidad';

@Entity({ name: 'servicios_basicos_sede' })
export class ServicioBasicoSedeTypeormEntidad {
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
    foreignKeyConstraintName: 'fk_servicios_basicos_sede_sedes',
  })
  sede!: SedeTypeormEntidad;
  @Column({ name: 'id_tipo_servicio_basico', type: 'uuid' })
  tipoServicioBasicoId!: string;
  @ManyToOne(() => TipoServicioBasicoTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_tipo_servicio_basico',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_servicios_basicos_sede_tipos_servicio_basico',
  })
  tipoServicioBasico!: TipoServicioBasicoTypeormEntidad;
  @Column({ name: 'proveedor', type: 'varchar', length: 150, nullable: true })
  proveedor!: string | null;
  @Column({
    name: 'numero_suministro',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  numeroSuministro!: string | null;
  @Column({ name: 'estado_servicio', type: 'varchar', length: 30 })
  estadoServicio!: string;
  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio!: string | null;
  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin!: string | null;
  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones!: string | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
