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
import { InstitucionEducativaTypeormEntidad } from '../../../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';

@Entity({ name: 'personas' })
@Index('ix_personas_institucion_estado', ['institucionEducativaId', 'estado'])
export class PersonaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;

  @Column({ name: 'nombres', type: 'varchar', length: 150 })
  nombres!: string;

  @Column({
    name: 'apellido_paterno',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoPaterno!: string | null;

  @Column({
    name: 'apellido_materno',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoMaterno!: string | null;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento!: Date | null;

  @Column({
    name: 'sexo_registral',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  sexoRegistral!: string | null;

  @Column({
    name: 'codigo_pais_nacionalidad',
    type: 'char',
    length: 2,
    nullable: true,
  })
  codigoPaisNacionalidad!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;

  @ManyToOne(() => InstitucionEducativaTypeormEntidad, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_institucion_educativa' })
  institucionEducativa?: InstitucionEducativaTypeormEntidad;
}

@Entity({ name: 'tipos_documento_identidad' })
export class TipoDocumentoIdentidadTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'codigo', type: 'varchar', length: 40, unique: true })
  codigo!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'longitud_minima', type: 'smallint', nullable: true })
  longitudMinima!: number | null;

  @Column({ name: 'longitud_maxima', type: 'smallint', nullable: true })
  longitudMaxima!: number | null;

  @Column({ name: 'patron', type: 'varchar', length: 200, nullable: true })
  patron!: string | null;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'documentos_identidad_persona' })
@Index(
  'ux_documentos_identidad_persona_unico',
  ['institucionEducativaId', 'tipoDocumentoId', 'numeroNormalizado'],
  {
    unique: true,
  },
)
export class DocumentoIdentidadPersonaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;

  @Column({ name: 'id_persona', type: 'uuid' })
  personaId!: string;

  @Column({ name: 'id_tipo_documento', type: 'uuid' })
  tipoDocumentoId!: string;

  @Column({ name: 'numero', type: 'varchar', length: 80 })
  numero!: string;

  @Column({ name: 'numero_normalizado', type: 'varchar', length: 80 })
  numeroNormalizado!: string;

  @Column({
    name: 'codigo_pais_emision',
    type: 'char',
    length: 2,
    nullable: true,
  })
  codigoPaisEmision!: string | null;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;

  @Column({ name: 'fecha_emision', type: 'date', nullable: true })
  fechaEmision!: Date | null;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento!: Date | null;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'medios_contacto_persona' })
export class MedioContactoPersonaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;

  @Column({ name: 'id_persona', type: 'uuid' })
  personaId!: string;

  @Column({ name: 'tipo', type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ name: 'valor', type: 'varchar', length: 320 })
  valor!: string;

  @Column({ name: 'valor_normalizado', type: 'varchar', length: 320 })
  valorNormalizado!: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;

  @Column({ name: 'verificado', type: 'boolean', default: false })
  verificado!: boolean;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}

@Entity({ name: 'direcciones_persona' })
export class DireccionPersonaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  institucionEducativaId!: string;

  @Column({ name: 'id_persona', type: 'uuid' })
  personaId!: string;

  @Column({ name: 'id_ubigeo', type: 'uuid', nullable: true })
  ubigeoId!: string | null;

  @Column({ name: 'direccion_linea', type: 'varchar', length: 250 })
  direccionLinea!: string;

  @Column({ name: 'referencia', type: 'varchar', length: 250, nullable: true })
  referencia!: string | null;

  @Column({
    name: 'latitud',
    type: 'numeric',
    precision: 9,
    scale: 6,
    nullable: true,
  })
  latitud!: string | null;

  @Column({
    name: 'longitud',
    type: 'numeric',
    precision: 9,
    scale: 6,
    nullable: true,
  })
  longitud!: string | null;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal!: boolean;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
