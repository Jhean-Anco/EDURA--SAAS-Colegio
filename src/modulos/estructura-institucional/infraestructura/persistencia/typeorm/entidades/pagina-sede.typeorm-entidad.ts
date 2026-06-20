import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SedeTypeormEntidad } from './sede.typeorm-entidad';
import { SeccionPaginaSedeTypeormEntidad } from './seccion-pagina-sede.typeorm-entidad';

@Entity({ name: 'paginas_sede' })
@Index('ux_paginas_sede_slug', ['sedeId', 'slug'], { unique: true })
@Index('ux_paginas_sede_inicio_publicada', ['sedeId', 'esPaginaInicio'], {
  unique: true,
})
export class PaginaSedeTypeormEntidad {
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
    foreignKeyConstraintName: 'fk_paginas_sede_sedes',
  })
  sede!: SedeTypeormEntidad;

  @Column({ name: 'slug', type: 'varchar', length: 120 })
  slug!: string;

  @Column({ name: 'titulo', type: 'varchar', length: 180 })
  titulo!: string;

  @Column({ name: 'resumen', type: 'varchar', length: 500, nullable: true })
  resumen!: string | null;

  @Column({
    name: 'descripcion_seo',
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  descripcionSeo!: string | null;

  @Column({ name: 'es_pagina_inicio', type: 'boolean', default: false })
  esPaginaInicio!: boolean;

  @Column({ name: 'visible_en_menu', type: 'boolean', default: true })
  visibleEnMenu!: boolean;

  @Column({ name: 'orden_menu', type: 'integer', default: 0 })
  ordenMenu!: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'BORRADOR' })
  estado!: string;

  @Column({ name: 'fecha_publicacion', type: 'timestamptz', nullable: true })
  fechaPublicacion!: Date | null;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @OneToMany(
    () => SeccionPaginaSedeTypeormEntidad,
    (seccion) => seccion.paginaSede,
  )
  secciones!: SeccionPaginaSedeTypeormEntidad[];

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
