import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'historial_cambios_seccion_matricula' })
export class HistorialSeccionMatriculaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'id_institucion_educativa', type: 'uuid' })
  idInstitucionEducativa!: string;

  @Column({ name: 'id_matricula', type: 'uuid' })
  idMatricula!: string;

  @Column({ name: 'id_seccion_anterior', type: 'uuid', nullable: true })
  idSeccionAnterior!: string | null;

  @Column({ name: 'id_seccion_nueva', type: 'uuid' })
  idSeccionNueva!: string;

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
