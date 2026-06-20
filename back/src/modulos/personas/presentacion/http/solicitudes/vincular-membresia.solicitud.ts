import { IsUUID } from 'class-validator';

export class VincularMembresiaSolicitud {
  @IsUUID()
  membresiaId!: string;
}
