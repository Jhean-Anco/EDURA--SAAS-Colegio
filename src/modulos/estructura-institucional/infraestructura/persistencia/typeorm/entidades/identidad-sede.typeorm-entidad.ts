import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SedeTypeormEntidad } from './sede.typeorm-entidad';
import { RecursoIdentidadSedeTypeormEntidad } from './recurso-identidad-sede.typeorm-entidad';

@Entity({ name: 'identidades_sede' })
@Index('ux_identidades_sede_id_sede', ['sedeId'], { unique: true })
@Index('ux_identidades_sede_slug_publico', ['slugPublico'], { unique: true })
export class IdentidadSedeTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_sede', type: 'uuid' })
  sedeId!: string;

  @OneToOne(() => SedeTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sede',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_identidades_sede_sedes',
  })
  sede!: SedeTypeormEntidad;

  @Column({ name: 'nombre_publico', type: 'varchar', length: 180 })
  nombrePublico!: string;

  @Column({ name: 'lema', type: 'varchar', length: 250, nullable: true })
  lema!: string | null;

  @Column({
    name: 'descripcion_corta',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  descripcionCorta!: string | null;

  @Column({
    name: 'color_primario',
    type: 'varchar',
    length: 7,
    nullable: true,
  })
  colorPrimario!: string | null;

  @Column({
    name: 'color_secundario',
    type: 'varchar',
    length: 7,
    nullable: true,
  })
  colorSecundario!: string | null;

  @Column({ name: 'color_acento', type: 'varchar', length: 7, nullable: true })
  colorAcento!: string | null;

  @Column({
    name: 'tipografia_titulos',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  tipografiaTitulos!: string | null;

  @Column({
    name: 'tipografia_textos',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  tipografiaTextos!: string | null;

  @Column({
    name: 'slug_publico',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  slugPublico!: string | null;

  @Column({ name: 'usar_en_portal_interno', type: 'boolean', default: true })
  usarEnPortalInterno!: boolean;

  @Column({ name: 'usar_en_pagina_publica', type: 'boolean', default: true })
  usarEnPaginaPublica!: boolean;

  @Column({
    name: 'estado_publicacion',
    type: 'varchar',
    length: 20,
    default: 'BORRADOR',
  })
  estadoPublicacion!: string;

  @Column({ name: 'fecha_publicacion', type: 'timestamptz', nullable: true })
  fechaPublicacion!: Date | null;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @OneToMany(
    () => RecursoIdentidadSedeTypeormEntidad,
    (recurso) => recurso.identidadSede,
  )
  recursos!: RecursoIdentidadSedeTypeormEntidad[];

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
