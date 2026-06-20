import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ElementoInfraestructuraTypeormEntidad } from './elemento-infraestructura.typeorm-entidad';

@Entity({ name: 'espacios_exteriores' })
export class EspacioExteriorTypeormEntidad {
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
      'fk_espacios_exteriores_elementos_infraestructura',
  })
  elementoInfraestructura!: ElementoInfraestructuraTypeormEntidad;
  @Column({ name: 'id_tipo_espacio_exterior', type: 'uuid' })
  tipoEspacioExteriorId!: string;
  @Column({
    name: 'area_m2',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  areaM2!: string | null;
  @Column({ name: 'es_techado', type: 'boolean', default: false })
  esTechado!: boolean;
  @Column({ name: 'es_accesible', type: 'boolean', default: false })
  esAccesible!: boolean;
  @Column({
    name: 'tipo_superficie',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  tipoSuperficie!: string | null;
}
