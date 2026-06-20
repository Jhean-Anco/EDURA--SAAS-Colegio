import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ElementoInfraestructuraTypeormEntidad } from './elemento-infraestructura.typeorm-entidad';

@Entity({ name: 'espacios_fisicos' })
export class EspacioFisicoTypeormEntidad {
  @PrimaryColumn('uuid', { name: 'id_elemento_infraestructura' })
  idElementoInfraestructura!: string;
  @OneToOne(() => ElementoInfraestructuraTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_elemento_infraestructura',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_espacios_fisicos_elementos_infraestructura',
  })
  elementoInfraestructura!: ElementoInfraestructuraTypeormEntidad;
  @Column({ name: 'id_tipo_espacio_fisico', type: 'uuid' })
  tipoEspacioFisicoId!: string;
  @Column({
    name: 'area_m2',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  areaM2!: string | null;
  @Column({ name: 'aforo', type: 'integer', nullable: true })
  aforo!: number | null;
  @Column({ name: 'uso_actual', type: 'varchar', length: 150, nullable: true })
  usoActual!: string | null;
  @Column({ name: 'es_accesible', type: 'boolean', default: false })
  esAccesible!: boolean;
  @Column({ name: 'cuenta_con_ventilacion', type: 'boolean', default: false })
  cuentaConVentilacion!: boolean;
  @Column({ name: 'cuenta_con_iluminacion', type: 'boolean', default: false })
  cuentaConIluminacion!: boolean;
}
