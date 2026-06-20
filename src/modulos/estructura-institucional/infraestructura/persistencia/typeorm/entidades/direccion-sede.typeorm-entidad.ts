import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SedeTypeormEntidad } from './sede.typeorm-entidad';

@Entity({ name: 'direcciones_sede' })
export class DireccionSedeTypeormEntidad {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'id_sede', type: 'uuid', unique: true })
  sedeId!: string;

  @OneToOne(() => SedeTypeormEntidad, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_sede',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_direcciones_sede_sedes',
  })
  sede!: SedeTypeormEntidad;

  @Column({ name: 'id_ubigeo', type: 'uuid', nullable: true })
  idUbigeo!: string | null;

  @Column({ name: 'direccion_linea', type: 'varchar', length: 250 })
  direccionLinea!: string;

  @Column({ name: 'referencia', type: 'varchar', length: 250, nullable: true })
  referencia!: string | null;

  @Column({
    name: 'latitud',
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitud!: string | null;

  @Column({
    name: 'longitud',
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitud!: string | null;

  @Column({
    name: 'codigo_postal',
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  codigoPostal!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
  fechaModificacion!: Date;
}
