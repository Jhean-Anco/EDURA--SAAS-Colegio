import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class AnularMatriculaSolicitud {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo!: string;
}
