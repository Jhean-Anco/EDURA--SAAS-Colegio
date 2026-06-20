import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ElementoInfraestructuraTypeormEntidad } from './elemento-infraestructura.typeorm-entidad';
import { EstadoConservacionTypeormEntidad } from './estado-conservacion.typeorm-entidad';

@Entity({ name: 'evaluaciones_conservacion_elemento' })
@Index('ix_evaluaciones_conservacion_elemento_elemento_fecha', [
  'elementoInfraestructuraId',
  'fechaEvaluacion',
])
export class EvaluacionConservacionElementoTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_elemento_infraestructura', type: 'uuid' })
  elementoInfraestructuraId!: string;

  @ManyToOne(() => ElementoInfraestructuraTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_elemento_infraestructura',
    referencedColumnName: 'id',
    foreignKeyConstraintName:
      'fk_evaluaciones_conservacion_elemento_elementos_infraestructura',
  })
  elementoInfraestructura!: ElementoInfraestructuraTypeormEntidad;

  @Column({ name: 'id_estado_conservacion', type: 'uuid' })
  estadoConservacionId!: string;

  @ManyToOne(() => EstadoConservacionTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_estado_conservacion',
    referencedColumnName: 'id',
    foreignKeyConstraintName:
      'fk_evaluaciones_conservacion_elemento_estados_conservacion',
  })
  estadoConservacion!: EstadoConservacionTypeormEntidad;

  @Column({ name: 'fecha_evaluacion', type: 'date' })
  fechaEvaluacion!: string;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observacion!: string | null;

  @Column({ name: 'id_usuario_evaluador', type: 'uuid', nullable: true })
  usuarioEvaluadorId!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
}
