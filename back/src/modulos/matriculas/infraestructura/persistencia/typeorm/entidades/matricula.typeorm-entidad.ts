import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'matriculas' })
export class MatriculaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_sede', type: 'uuid' })
  idSede!: string;

  @Column({ name: 'id_estudiante', type: 'uuid' })
  idEstudiante!: string;

  @Column({ name: 'id_anio_academico', type: 'uuid' })
  idAnioAcademico!: string;

  @Column({ name: 'id_nivel_educativo', type: 'uuid' })
  idNivelEducativo!: string;

  @Column({ name: 'id_grado_educativo', type: 'uuid' })
  idGradoEducativo!: string;

  @Column({ name: 'id_oferta_grado_sede', type: 'uuid' })
  idOfertaGradoSede!: string;

  @Column({ name: 'id_seccion_academica', type: 'uuid', nullable: true })
  idSeccionAcademica!: string | null;

  @Column({ name: 'codigo_matricula', type: 'varchar', length: 40 })
  codigoMatricula!: string;

  @Column({ name: 'fecha_matricula', type: 'date' })
  fechaMatricula!: string; // TypeORM maps date to string (YYYY-MM-DD)

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'BORRADOR' })
  estado!: string;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;

  @Column({ name: 'id_usuario_creador', type: 'uuid' })
  idUsuarioCreador!: string;

  @Column({ name: 'id_usuario_activador', type: 'uuid', nullable: true })
  idUsuarioActivador!: string | null;

  @Column({ name: 'fecha_activacion', type: 'timestamptz', nullable: true })
  fechaActivacion!: Date | null;

  @Column({ name: 'id_usuario_retiro', type: 'uuid', nullable: true })
  idUsuarioRetiro!: string | null;

  @Column({ name: 'fecha_retiro', type: 'timestamptz', nullable: true })
  fechaRetiro!: Date | null;

  @Column({ name: 'motivo_retiro', type: 'text', nullable: true })
  motivoRetiro!: string | null;

  @Column({ name: 'id_usuario_anulacion', type: 'uuid', nullable: true })
  idUsuarioAnulacion!: string | null;

  @Column({ name: 'fecha_anulacion', type: 'timestamptz', nullable: true })
  fechaAnulacion!: Date | null;

  @Column({ name: 'motivo_anulacion', type: 'text', nullable: true })
  motivoAnulacion!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
