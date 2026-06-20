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
import { SedeTypeormEntidad } from './sede.typeorm-entidad';

@Entity({ name: 'horarios_atencion_sede' })
@Index(
  'ux_horarios_atencion_sede_dia_intervalo',
  ['sedeId', 'diaSemana', 'ordenIntervalo'],
  {
    unique: true,
  },
)
export class HorarioAtencionSedeTypeormEntidad {
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
    foreignKeyConstraintName: 'fk_horarios_atencion_sede_sedes',
  })
  sede!: SedeTypeormEntidad;

  @Column({ name: 'dia_semana', type: 'smallint' })
  diaSemana!: number;

  @Column({ name: 'orden_intervalo', type: 'smallint', default: 1 })
  ordenIntervalo!: number;

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  horaInicio!: string | null;

  @Column({ name: 'hora_fin', type: 'time', nullable: true })
  horaFin!: string | null;

  @Column({ name: 'cerrado', type: 'boolean', default: false })
  cerrado!: boolean;

  @Column({
    name: 'observaciones',
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  observaciones!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
