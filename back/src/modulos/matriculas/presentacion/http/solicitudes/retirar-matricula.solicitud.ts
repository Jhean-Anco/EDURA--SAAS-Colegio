import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RetirarMatriculaSolicitud {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo!: string;
}
