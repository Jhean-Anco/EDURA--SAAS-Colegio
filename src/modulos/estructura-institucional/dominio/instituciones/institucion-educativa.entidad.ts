import {
  EstadoIncompatibleError,
  ReglaNegocioError,
} from '../../../../compartido/dominio/errores-dominio';

export type EstadoInstitucionEducativa = 'ACTIVA' | 'INACTIVA' | 'BAJA';

export interface InstitucionEducativaProps {
  id: string;
  codigo: string;
  nombreLegal: string;
  nombreCorto: string | null;
  tipoGestion: string | null;
  estado: EstadoInstitucionEducativa;
}

export class InstitucionEducativa {
  private constructor(private readonly props: InstitucionEducativaProps) {}

  static reconstruir(props: InstitucionEducativaProps): InstitucionEducativa {
    return new InstitucionEducativa(props);
  }

  static crear(input: {
    id: string;
    codigo: string;
    nombreLegal: string;
    nombreCorto?: string | null;
    tipoGestion?: string | null;
  }): InstitucionEducativa {
    const codigo = input.codigo.trim().toUpperCase();
    if (!codigo) {
      throw new ReglaNegocioError(
        'El código de institución no puede quedar vacío.',
      );
    }
    if (!input.nombreLegal.trim()) {
      throw new ReglaNegocioError('El nombre legal es obligatorio.');
    }
    return new InstitucionEducativa({
      id: input.id,
      codigo,
      nombreLegal: input.nombreLegal.trim(),
      nombreCorto: input.nombreCorto?.trim() ?? null,
      tipoGestion: input.tipoGestion?.trim() ?? null,
      estado: 'ACTIVA',
    });
  }

  actualizarDatos(input: {
    nombreLegal: string;
    nombreCorto?: string | null;
    tipoGestion?: string | null;
  }): void {
    if (this.props.estado === 'BAJA') {
      throw new EstadoIncompatibleError(
        'Una institución dada de baja no se modifica ni reactiva.',
      );
    }
    const nombreLegal = input.nombreLegal.trim();
    if (!nombreLegal) {
      throw new ReglaNegocioError('El nombre legal es obligatorio.');
    }
    this.props.nombreLegal = nombreLegal;
    this.props.nombreCorto = input.nombreCorto?.trim() ?? null;
    this.props.tipoGestion = input.tipoGestion?.trim() ?? null;
  }

  activar(): void {
    if (this.props.estado === 'BAJA') {
      throw new EstadoIncompatibleError(
        'Una institución dada de baja no se reactiva.',
      );
    }
    this.props.estado = 'ACTIVA';
  }

  desactivar(): void {
    if (this.props.estado === 'BAJA') {
      throw new EstadoIncompatibleError(
        'Una institución dada de baja no cambia de estado.',
      );
    }
    this.props.estado = 'INACTIVA';
  }

  darDeBaja(): void {
    this.props.estado = 'BAJA';
  }

  get id(): string {
    return this.props.id;
  }

  get codigo(): string {
    return this.props.codigo;
  }

  get estado(): EstadoInstitucionEducativa {
    return this.props.estado;
  }

  get nombreLegal(): string {
    return this.props.nombreLegal;
  }

  get nombreCorto(): string | null {
    return this.props.nombreCorto;
  }

  get tipoGestion(): string | null {
    return this.props.tipoGestion;
  }
}
