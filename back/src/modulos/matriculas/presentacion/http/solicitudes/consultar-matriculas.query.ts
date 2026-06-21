import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ConsultaPaginadaSolicitud } from '../../../../../compartido/presentacion/http/solicitudes/consulta-paginada.solicitud';

export class ConsultarMatriculasQueryDto extends ConsultaPaginadaSolicitud {
  @IsUUID()
  @IsOptional()
  idSede?: string;

  @IsUUID()
  @IsOptional()
  idAnioAcademico?: string;

  @IsUUID()
  @IsOptional()
  idNivelEducativo?: string;

  @IsUUID()
  @IsOptional()
  idGradoEducativo?: string;

  @IsUUID()
  @IsOptional()
  idSeccion?: string;

  @IsUUID()
  @IsOptional()
  idEstudiante?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  busqueda?: string;
}
