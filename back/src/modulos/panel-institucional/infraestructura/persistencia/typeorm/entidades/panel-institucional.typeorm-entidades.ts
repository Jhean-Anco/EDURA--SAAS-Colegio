import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'alertas_institucionales' })
@Index('ix_alertas_institucionales_institucion_estado_prioridad', [
  'institucionEducativaId',
  'estado',
  'prioridad',
])
@Index('ix_alertas_institucionales_institucion_sede_estado', [
  'institucionEducativaId',
  'sedeId',
  'estado',
])
export class AlertaInstitucionalTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;
  @Column({ name: 'id_sede', type: 'uuid', nullable: true })
  sedeId!: string | null;
  @Column({ name: 'tipo', type: 'varchar', length: 40 })
  tipo!: string;
  @Column({ name: 'titulo', type: 'varchar', length: 160 })
  titulo!: string;
  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;
  @Column({ name: 'prioridad', type: 'varchar', length: 20 })
  prioridad!: string;
  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;
  @Column({ name: 'modulo_origen', type: 'varchar', length: 80 })
  moduloOrigen!: string;
  @Column({
    name: 'id_recurso_origen',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  recursoOrigenId!: string | null;
  @Column({ name: 'fecha_generacion', type: 'timestamptz' })
  fechaGeneracion!: Date;
  @Column({ name: 'fecha_resolucion', type: 'timestamptz', nullable: true })
  fechaResolucion!: Date | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'comunicados_institucionales' })
export class ComunicadoInstitucionalTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;
  @Column({ name: 'id_sede', type: 'uuid', nullable: true })
  sedeId!: string | null;
  @Column({ name: 'titulo', type: 'varchar', length: 160 })
  titulo!: string;
  @Column({ name: 'contenido', type: 'text' })
  contenido!: string;
  @Column({ name: 'tipo', type: 'varchar', length: 40 })
  tipo!: string;
  @Column({ name: 'prioridad', type: 'varchar', length: 20 })
  prioridad!: string;
  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;
  @Column({ name: 'fecha_publicacion', type: 'timestamptz', nullable: true })
  fechaPublicacion!: Date | null;
  @Column({ name: 'id_usuario_creador', type: 'uuid', nullable: true })
  usuarioCreadorId!: string | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
