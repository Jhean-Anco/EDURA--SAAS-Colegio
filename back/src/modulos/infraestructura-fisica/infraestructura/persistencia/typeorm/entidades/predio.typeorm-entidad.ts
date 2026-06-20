import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ElementoInfraestructuraTypeormEntidad } from './elemento-infraestructura.typeorm-entidad';
import { TipoTenenciaPredioTypeormEntidad } from './tipo-tenencia-predio.typeorm-entidad';

@Entity({ name: 'predios' })
export class PredioTypeormEntidad {
  @PrimaryColumn('uuid', { name: 'id_elemento_infraestructura' })
  idElementoInfraestructura!: string;
  @OneToOne(() => ElementoInfraestructuraTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_elemento_infraestructura',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_predios_elementos_infraestructura',
  })
  elementoInfraestructura!: ElementoInfraestructuraTypeormEntidad;
  @Column({ name: 'id_tipo_tenencia', type: 'uuid', nullable: true })
  tipoTenenciaId!: string | null;

  @ManyToOne(() => TipoTenenciaPredioTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({
    name: 'id_tipo_tenencia',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_predios_tipos_tenencia_predio',
  })
  tipoTenencia!: TipoTenenciaPredioTypeormEntidad | null;
  @Column({
    name: 'area_total_m2',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  areaTotalM2!: string | null;
  @Column({
    name: 'partida_registral',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  partidaRegistral!: string | null;
  @Column({
    name: 'codigo_catastral',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  codigoCatastral!: string | null;
  @Column({ name: 'observaciones_legales', type: 'text', nullable: true })
  observacionesLegales!: string | null;
}
