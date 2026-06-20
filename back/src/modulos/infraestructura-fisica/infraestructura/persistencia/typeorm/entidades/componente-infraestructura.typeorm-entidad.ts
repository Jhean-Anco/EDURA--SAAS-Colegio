import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ElementoInfraestructuraTypeormEntidad } from './elemento-infraestructura.typeorm-entidad';
import { TipoComponenteInfraestructuraTypeormEntidad } from './tipo-componente-infraestructura.typeorm-entidad';
import { UnidadMedidaTypeormEntidad } from './unidad-medida.typeorm-entidad';

@Entity({ name: 'componentes_infraestructura' })
export class ComponenteInfraestructuraTypeormEntidad {
  @PrimaryColumn('uuid', { name: 'id_elemento_infraestructura' })
  idElementoInfraestructura!: string;
  @OneToOne(() => ElementoInfraestructuraTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_elemento_infraestructura',
    referencedColumnName: 'id',
    foreignKeyConstraintName:
      'fk_componentes_infraestructura_elementos_infraestructura',
  })
  elementoInfraestructura!: ElementoInfraestructuraTypeormEntidad;
  @Column({ name: 'id_tipo_componente', type: 'uuid' })
  tipoComponenteId!: string;
  @ManyToOne(() => TipoComponenteInfraestructuraTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_tipo_componente',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_componentes_infraestructura_tipos_componente',
  })
  tipoComponente!: TipoComponenteInfraestructuraTypeormEntidad;
  @Column({ name: 'id_unidad_medida', type: 'uuid' })
  unidadMedidaId!: string;
  @ManyToOne(() => UnidadMedidaTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_unidad_medida',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_componentes_infraestructura_unidades_medida',
  })
  unidadMedida!: UnidadMedidaTypeormEntidad;
  @Column({
    name: 'cantidad',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 1,
  })
  cantidad!: string;
  @Column({ name: 'material', type: 'varchar', length: 100, nullable: true })
  material!: string | null;
  @Column({ name: 'marca', type: 'varchar', length: 100, nullable: true })
  marca!: string | null;
  @Column({ name: 'modelo', type: 'varchar', length: 100, nullable: true })
  modelo!: string | null;
  @Column({ name: 'fecha_instalacion', type: 'date', nullable: true })
  fechaInstalacion!: string | null;
  @Column({ name: 'vida_util_meses', type: 'integer', nullable: true })
  vidaUtilMeses!: number | null;
  @Column({
    name: 'numero_serie',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  numeroSerie!: string | null;
}
