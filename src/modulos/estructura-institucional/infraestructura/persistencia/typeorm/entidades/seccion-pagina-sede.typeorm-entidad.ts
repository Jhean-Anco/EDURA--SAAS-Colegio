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
import { PaginaSedeTypeormEntidad } from './pagina-sede.typeorm-entidad';

@Entity({ name: 'secciones_pagina_sede' })
@Index('ux_secciones_pagina_sede_pagina_orden', ['paginaSedeId', 'orden'], {
  unique: true,
})
export class SeccionPaginaSedeTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_pagina_sede', type: 'uuid' })
  paginaSedeId!: string;

  @ManyToOne(() => PaginaSedeTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_pagina_sede',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_secciones_pagina_sede_paginas_sede',
  })
  paginaSede!: PaginaSedeTypeormEntidad;

  @Column({ name: 'tipo_seccion', type: 'varchar', length: 30 })
  tipoSeccion!: string;

  @Column({ name: 'titulo', type: 'varchar', length: 180, nullable: true })
  titulo!: string | null;

  @Column({ name: 'contenido', type: 'jsonb' })
  contenido!: Record<string, unknown>;

  @Column({ name: 'orden', type: 'integer' })
  orden!: number;

  @Column({ name: 'visible', type: 'boolean', default: true })
  visible!: boolean;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
