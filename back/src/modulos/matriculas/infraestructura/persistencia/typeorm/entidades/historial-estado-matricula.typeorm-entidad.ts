import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'historial_estados_matricula' })
export class HistorialEstadoMatriculaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_matricula', type: 'uuid' })
  idMatricula!: string;

  @Column({
    name: 'estado_anterior',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  estadoAnterior!: string | null;

  @Column({ name: 'estado_nuevo', type: 'varchar', length: 20 })
  estadoNuevo!: string;

  @Column({ name: 'motivo', type: 'text', nullable: true })
  motivo!: string | null;

  @Column({ name: 'id_usuario', type: 'uuid' })
  idUsuario!: string;

  @Column({
    name: 'correlacion_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  correlacionId!: string | null;

  @CreateDateColumn({ name: 'fecha', type: 'timestamptz' })
  fecha!: Date;
}
