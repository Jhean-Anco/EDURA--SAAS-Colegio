import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ElementoInfraestructuraTypeormEntidad } from './elemento-infraestructura.typeorm-entidad';

@Entity({ name: 'edificaciones' })
export class EdificacionTypeormEntidad {
  @PrimaryColumn('uuid', { name: 'id_elemento_infraestructura' })
  idElementoInfraestructura!: string;
  @OneToOne(() => ElementoInfraestructuraTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_elemento_infraestructura',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_edificaciones_elementos_infraestructura',
  })
  elementoInfraestructura!: ElementoInfraestructuraTypeormEntidad;
  @Column({ name: 'id_tipo_edificacion', type: 'uuid', nullable: true })
  tipoEdificacionId!: string | null;
  @Column({ name: 'anio_construccion', type: 'integer', nullable: true })
  anioConstruccion!: number | null;
  @Column({
    name: 'area_techada_m2',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  areaTechadaM2!: string | null;
  @Column({
    name: 'area_construida_m2',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  areaConstruidaM2!: string | null;
  @Column({
    name: 'material_predominante',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  materialPredominante!: string | null;
  @Column({
    name: 'numero_niveles_declarados',
    type: 'integer',
    nullable: true,
  })
  numeroNivelesDeclarados!: number | null;
  @Column({ name: 'cuenta_con_accesibilidad', type: 'boolean', default: false })
  cuentaConAccesibilidad!: boolean;
}
