import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ElementoInfraestructuraTypeormEntidad } from './elemento-infraestructura.typeorm-entidad';

@Entity({ name: 'niveles' })
export class NivelTypeormEntidad {
  @PrimaryColumn('uuid', { name: 'id_elemento_infraestructura' })
  idElementoInfraestructura!: string;
  @OneToOne(() => ElementoInfraestructuraTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_elemento_infraestructura',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_niveles_elementos_infraestructura',
  })
  elementoInfraestructura!: ElementoInfraestructuraTypeormEntidad;
  @Column({ name: 'numero_nivel', type: 'integer' })
  numeroNivel!: number;
  @Column({
    name: 'denominacion',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  denominacion!: string | null;
  @Column({
    name: 'cota_metros',
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  cotaMetros!: string | null;
  @Column({
    name: 'area_m2',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  areaM2!: string | null;
}
