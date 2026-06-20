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
import { SedeTypeormEntidad } from '../../../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/sede.typeorm-entidad';
import { EstadoConservacionTypeormEntidad } from './estado-conservacion.typeorm-entidad';
import { TipoElementoInfraestructuraTypeormEntidad } from './tipo-elemento-infraestructura.typeorm-entidad';

@Entity({ name: 'elementos_infraestructura' })
@Index('ux_elementos_infraestructura_sede_codigo', ['sedeId', 'codigo'], {
  unique: true,
})
@Index('ux_elementos_infraestructura_id_sede', ['id', 'sedeId'], {
  unique: true,
})
@Index('ix_elementos_infraestructura_padre', ['idElementoPadre'])
@Index('ix_elementos_infraestructura_sede_tipo', ['sedeId', 'tipoElementoId'])
@Index('ix_elementos_infraestructura_sede_estado', ['sedeId', 'estado'])
@Index('ix_elementos_infraestructura_estado_conservacion', [
  'estadoConservacionId',
])
export class ElementoInfraestructuraTypeormEntidad {
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
    foreignKeyConstraintName: 'fk_elementos_infraestructura_sedes',
  })
  sede!: SedeTypeormEntidad;
  @Column({ name: 'id_elemento_padre', type: 'uuid', nullable: true })
  idElementoPadre!: string | null;
  @Column({ name: 'id_tipo_elemento', type: 'uuid' })
  tipoElementoId!: string;
  @ManyToOne(() => TipoElementoInfraestructuraTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_tipo_elemento',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_elementos_infraestructura_tipos_elemento',
  })
  tipoElemento!: TipoElementoInfraestructuraTypeormEntidad;
  @Column({ name: 'id_estado_conservacion', type: 'uuid', nullable: true })
  estadoConservacionId!: string | null;
  @ManyToOne(() => EstadoConservacionTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({
    name: 'id_estado_conservacion',
    referencedColumnName: 'id',
    foreignKeyConstraintName:
      'fk_elementos_infraestructura_estados_conservacion',
  })
  estadoConservacion!: EstadoConservacionTypeormEntidad | null;
  @Column({ name: 'codigo', type: 'varchar', length: 40 })
  codigo!: string;
  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;
  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;
  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;
  @Column({ name: 'orden', type: 'integer', default: 0 })
  orden!: number;
  @Column({ name: 'fecha_alta', type: 'date', nullable: true })
  fechaAlta!: string | null;
  @Column({ name: 'fecha_baja', type: 'date', nullable: true })
  fechaBaja!: string | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
