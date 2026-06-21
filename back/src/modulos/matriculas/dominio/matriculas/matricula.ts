import {
  TransicionEstadoInvalidaError,
  EdicionBorradorSoloPermitidaError,
} from '../errores-matriculas';

export type EstadoMatricula = 'BORRADOR' | 'ACTIVA' | 'RETIRADA' | 'ANULADA';

export interface HistorialEstado {
  id?: string;
  idMatricula?: string;
  estadoAnterior: EstadoMatricula | null;
  estadoNuevo: EstadoMatricula;
  motivo: string | null;
  idUsuario: string;
  fecha: Date;
  correlacionId?: string | null;
}

export interface HistorialSeccion {
  id?: string;
  idMatricula?: string;
  idSeccionAnterior: string | null;
  idSeccionNueva: string;
  motivo: string | null;
  idUsuario: string;
  fecha: Date;
  correlacionId?: string | null;
}

export class Matricula {
  constructor(
    public readonly id: string,
    public readonly idInstitucionEducativa: string,
    public idSede: string,
    public idEstudiante: string,
    public idAnioAcademico: string,
    public idNivelEducativo: string,
    public idGradoEducativo: string,
    public idOfertaGradoSede: string,
    public idSeccionAcademica: string | null,
    public codigoMatricula: string,
    public fechaMatricula: Date,
    public estado: EstadoMatricula,
    public observacion: string | null,
    public readonly idUsuarioCreador: string,
    public idUsuarioActivador: string | null,
    public fechaActivacion: Date | null,
    public idUsuarioRetiro: string | null,
    public fechaRetiro: Date | null,
    public motivoRetiro: string | null,
    public idUsuarioAnulacion: string | null,
    public fechaAnulacion: Date | null,
    public motivoAnulacion: string | null,
    public readonly fechaCreacion: Date,
    public fechaModificacion: Date,
  ) {}

  public actualizarDatosBorrador(datos: {
    idSede?: string;
    idEstudiante?: string;
    idAnioAcademico?: string;
    idNivelEducativo?: string;
    idGradoEducativo?: string;
    idOfertaGradoSede?: string;
    idSeccionAcademica?: string | null;
    codigoMatricula?: string;
    fechaMatricula?: Date;
    observacion?: string | null;
  }): void {
    if (this.estado !== 'BORRADOR') {
      throw new EdicionBorradorSoloPermitidaError();
    }

    if (datos.idSede !== undefined) this.idSede = datos.idSede;
    if (datos.idEstudiante !== undefined)
      this.idEstudiante = datos.idEstudiante;
    if (datos.idAnioAcademico !== undefined)
      this.idAnioAcademico = datos.idAnioAcademico;
    if (datos.idNivelEducativo !== undefined)
      this.idNivelEducativo = datos.idNivelEducativo;
    if (datos.idGradoEducativo !== undefined)
      this.idGradoEducativo = datos.idGradoEducativo;
    if (datos.idOfertaGradoSede !== undefined)
      this.idOfertaGradoSede = datos.idOfertaGradoSede;
    if (datos.idSeccionAcademica !== undefined)
      this.idSeccionAcademica = datos.idSeccionAcademica;
    if (datos.codigoMatricula !== undefined)
      this.codigoMatricula = datos.codigoMatricula;
    if (datos.fechaMatricula !== undefined)
      this.fechaMatricula = datos.fechaMatricula;
    if (datos.observacion !== undefined) this.observacion = datos.observacion;

    this.fechaModificacion = new Date();
  }

  public activar(usuarioId: string, fecha: Date): void {
    if (this.estado !== 'BORRADOR') {
      throw new TransicionEstadoInvalidaError(this.estado, 'ACTIVA');
    }

    this.estado = 'ACTIVA';
    this.idUsuarioActivador = usuarioId;
    this.fechaActivacion = fecha;
    this.fechaModificacion = fecha;
  }

  public anular(usuarioId: string, fecha: Date, motivo: string): void {
    if (this.estado !== 'BORRADOR') {
      throw new TransicionEstadoInvalidaError(this.estado, 'ANULADA');
    }
    if (!motivo || motivo.trim() === '') {
      throw new Error('El motivo de anulacion es obligatorio.');
    }

    this.estado = 'ANULADA';
    this.idUsuarioAnulacion = usuarioId;
    this.fechaAnulacion = fecha;
    this.motivoAnulacion = motivo;
    this.fechaModificacion = fecha;
  }

  public retirar(usuarioId: string, fecha: Date, motivo: string): void {
    if (this.estado !== 'ACTIVA') {
      throw new TransicionEstadoInvalidaError(this.estado, 'RETIRADA');
    }
    if (!motivo || motivo.trim() === '') {
      throw new Error('El motivo de retiro es obligatorio.');
    }

    this.estado = 'RETIRADA';
    this.idUsuarioRetiro = usuarioId;
    this.fechaRetiro = fecha;
    this.motivoRetiro = motivo;
    this.fechaModificacion = fecha;
  }

  public cambiarSeccion(idNuevaSeccion: string | null): void {
    if (this.estado !== 'ACTIVA' && this.estado !== 'BORRADOR') {
      throw new EdicionBorradorSoloPermitidaError();
    }
    this.idSeccionAcademica = idNuevaSeccion;
    this.fechaModificacion = new Date();
  }
}
export interface AlcanceAcceso {
  usuarioId: string;
  institucionId: string;
  ambito: 'INSTITUCION' | 'SEDE';
  sedeId: string | null;
}
