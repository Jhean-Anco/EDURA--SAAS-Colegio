import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('areas_curriculares')
export class AreaCurricularEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'codigo', type: 'varchar', length: 30 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', type: 'varchar', length: 30 })
  codigoNormalizado!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'nombre_normalizado', type: 'varchar', length: 150 })
  nombreNormalizado!: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'orden', type: 'smallint' })
  orden!: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaCreacion!: Date;

  @Column({
    name: 'fecha_modificacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaModificacion!: Date;
}

@Entity('asignaturas')
export class AsignaturaEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_area_curricular', type: 'uuid' })
  idAreaCurricular!: string;

  @Column({ name: 'codigo', type: 'varchar', length: 30 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', type: 'varchar', length: 30 })
  codigoNormalizado!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'nombre_corto', type: 'varchar', length: 60, nullable: true })
  nombreCorto!: string | null;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'orden', type: 'smallint' })
  orden!: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaCreacion!: Date;

  @Column({
    name: 'fecha_modificacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaModificacion!: Date;
}

@Entity('planes_estudio')
export class PlanEstudioEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_anio_academico', type: 'uuid' })
  idAnioAcademico!: string;

  @Column({ name: 'id_grado_educativo', type: 'uuid' })
  idGradoEducativo!: string;

  @Column({ name: 'codigo', type: 'varchar', length: 40 })
  codigo!: string;

  @Column({ name: 'codigo_normalizado', type: 'varchar', length: 40 })
  codigoNormalizado!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 180 })
  nombre!: string;

  @Column({ name: 'version', type: 'smallint' })
  version!: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'BORRADOR' })
  estado!: string;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;

  @Column({ name: 'fecha_aprobacion', type: 'timestamptz', nullable: true })
  fechaAprobacion!: Date | null;

  @Column({ name: 'id_usuario_aprobador', type: 'uuid', nullable: true })
  idUsuarioAprobador!: string | null;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaCreacion!: Date;

  @Column({
    name: 'fecha_modificacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaModificacion!: Date;
}

@Entity('detalles_plan_estudio')
export class DetallePlanEstudioEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_plan_estudio', type: 'uuid' })
  idPlanEstudio!: string;

  @Column({ name: 'id_asignatura', type: 'uuid' })
  idAsignatura!: string;

  @Column({ name: 'tipo', type: 'varchar', length: 20 })
  tipo!: string;

  @Column({ name: 'horas_semanales', type: 'smallint' })
  horasSemanales!: number;

  @Column({ name: 'horas_anuales', type: 'smallint' })
  horasAnuales!: number;

  @Column({ name: 'orden', type: 'smallint' })
  orden!: number;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaCreacion!: Date;

  @Column({
    name: 'fecha_modificacion',
    type: 'timestamptz',
    default: () => 'now()',
  })
  fechaModificacion!: Date;
}
