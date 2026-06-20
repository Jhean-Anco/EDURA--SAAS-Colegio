import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'instituciones_educativas' })
@Index('ux_instituciones_educativas_codigo', ['codigo'], { unique: true })
export class InstitucionEducativaTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'codigo', type: 'varchar', length: 30 })
  codigo!: string;

  @Column({ name: 'nombre_legal', type: 'varchar', length: 200 })
  nombreLegal!: string;

  @Column({
    name: 'nombre_corto',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  nombreCorto!: string | null;

  @Column({ name: 'tipo_gestion', type: 'varchar', length: 30, nullable: true })
  tipoGestion!: string | null;

  @Column({ name: 'estado', type: 'varchar', length: 20 })
  estado!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
